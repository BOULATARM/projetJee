package com.lias.service.impl;

import com.lias.dto.request.DocumentRequestDTO;
import com.lias.entity.*;
import com.lias.enums.StatutDocument;
import com.lias.enums.TypeDocument;
import com.lias.enums.TypeNotification;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.*;
import com.lias.service.DocumentService;
import com.lias.service.FileStorageService;
import com.lias.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final MembreRepository membreRepository;
    private final EvenementRepository evenementRepository;
    private final ReunionRepository reunionRepository;
    private final ConventionRepository conventionRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public Document uploadDocument(MultipartFile file, DocumentRequestDTO dto, Long membreId, boolean isPrivileged) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));

        String filePath = fileStorageService.uploadFile(file, "documents");

        // All documents require director approval regardless of the uploader's role
        StatutDocument statut = StatutDocument.PENDING;

        Document document = Document.builder()
                .nom(dto.getNom() != null ? dto.getNom() : file.getOriginalFilename())
                .description(dto.getDescription())
                .cheminFichier(filePath)
                .typeDocument(dto.getTypeDocument() != null ? dto.getTypeDocument() : TypeDocument.AUTRE)
                .dateUpload(LocalDateTime.now())
                .uploadePar(membre)
                .taille(file.getSize())
                .mimeType(file.getContentType())
                .statut(statut)
                .build();

        if (dto.getEvenementId() != null) {
            Evenement evenement = evenementRepository.findById(dto.getEvenementId())
                    .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", dto.getEvenementId()));
            document.setEvenement(evenement);
        }
        if (dto.getReunionId() != null) {
            Reunion reunion = reunionRepository.findById(dto.getReunionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", dto.getReunionId()));
            document.setReunion(reunion);
        }
        if (dto.getConventionId() != null) {
            Convention convention = conventionRepository.findById(dto.getConventionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Convention", "id", dto.getConventionId()));
            document.setConvention(convention);
        }

        Document saved = documentRepository.save(document);

        if (isPrivileged) {
            // Notify all members about the new published document
            String nomDoc = saved.getNom();
            membreRepository.findByActiveTrue().forEach(m -> {
                if (!m.getId().equals(membreId)) {
                    notificationService.envoyerNotification(
                            m.getId(),
                            membre.getPrenom() + " " + membre.getNom() + " a publié un nouveau document : \"" + nomDoc + "\".",
                            TypeNotification.NOUVEAU_DOCUMENT
                    );
                }
            });
        } else {
            // Notify director(s) that a member submitted a document for approval
            String nomDoc = saved.getNom();
            membreRepository.findByActiveTrue().forEach(m -> {
                boolean isDirecteur = m.getRoles() != null && m.getRoles().stream()
                        .anyMatch(r -> r.getRole() != null && "DIRECTEUR".equals(r.getRole().name()));
                if (isDirecteur) {
                    notificationService.envoyerNotification(
                            m.getId(),
                            membre.getPrenom() + " " + membre.getNom() + " a soumis un document en attente d'approbation : \"" + nomDoc + "\".",
                            TypeNotification.NOUVEAU_DOCUMENT
                    );
                }
            });
        }

        return saved;
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findByStatutOrderByDateUploadDesc(StatutDocument.APPROUVE);
    }

    @Override
    public List<Document> getDocumentsPending() {
        return documentRepository.findByStatutOrderByDateUploadDesc(StatutDocument.PENDING);
    }

    @Override
    public List<Document> getHistoriqueDecisions() {
        return documentRepository.findAllByOrderByDateUploadDesc();
    }

    @Override
    public List<Document> getMesDocuments(Long membreId) {
        return documentRepository.findByUploadeParIdOrderByDateUploadDesc(membreId);
    }

    @Override
    @Transactional
    public Document approuverDocument(Long documentId, Long directeurId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        Membre directeur = membreRepository.findById(directeurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", directeurId));

        document.setStatut(StatutDocument.APPROUVE);
        document.setDateDecision(LocalDateTime.now());
        document.setApprouvePar(directeur);

        Document saved = documentRepository.save(document);

        // Notify the uploader
        if (document.getUploadePar() != null) {
            notificationService.envoyerNotification(
                    document.getUploadePar().getId(),
                    "Votre document \"" + document.getNom() + "\" a été approuvé et publié.",
                    TypeNotification.NOUVEAU_DOCUMENT
            );
        }

        // Notify all active members about the newly published document
        String nomDoc = saved.getNom();
        Long uploadeurId = document.getUploadePar() != null ? document.getUploadePar().getId() : -1L;
        membreRepository.findByActiveTrue().forEach(m -> {
            if (!m.getId().equals(uploadeurId) && !m.getId().equals(directeurId)) {
                notificationService.envoyerNotification(
                        m.getId(),
                            "Un nouveau document a été publié : \"" + nomDoc + "\".",
                        TypeNotification.NOUVEAU_DOCUMENT
                );
            }
        });

        return saved;
    }

    @Override
    @Transactional
    public Document rejeterDocument(Long documentId, String motifRefus, Long directeurId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        Membre directeur = membreRepository.findById(directeurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", directeurId));

        document.setStatut(StatutDocument.REJETE);
        document.setMotifRefus(motifRefus);
        document.setDateDecision(LocalDateTime.now());
        document.setApprouvePar(directeur);

        Document saved = documentRepository.save(document);

        // Notify the uploader
        if (document.getUploadePar() != null) {
            String msg = "Votre document \"" + document.getNom() + "\" a été refusé.";
            if (motifRefus != null && !motifRefus.isBlank()) {
                msg += " Motif : " + motifRefus;
            }
            notificationService.envoyerNotification(
                    document.getUploadePar().getId(),
                    msg,
                    TypeNotification.NOUVEAU_DOCUMENT
            );
        }

        return saved;
    }

    @Override
    public List<Document> getDocumentsByEvenement(Long evenementId) {
        return documentRepository.findByEvenementId(evenementId);
    }

    @Override
    public List<Document> getDocumentsByReunion(Long reunionId) {
        return documentRepository.findByReunionId(reunionId);
    }

    @Override
    public List<Document> getDocumentsByConvention(Long conventionId) {
        return documentRepository.findByConventionId(conventionId);
    }

    @Override
    public Resource downloadDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return fileStorageService.loadFileAsResource(document.getCheminFichier());
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        fileStorageService.deleteFile(document.getCheminFichier());
        documentRepository.delete(document);
    }
}
