package com.lias.service.impl;

import com.lias.dto.request.DocumentRequestDTO;
import com.lias.entity.Document;
import com.lias.entity.Evenement;
import com.lias.entity.Membre;
import com.lias.entity.Reunion;
import com.lias.entity.Convention;
import com.lias.enums.TypeDocument;
import com.lias.enums.TypeNotification;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.ConventionRepository;
import com.lias.repository.DocumentRepository;
import com.lias.repository.EvenementRepository;
import com.lias.repository.MembreRepository;
import com.lias.repository.ReunionRepository;
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
    public Document uploadDocument(MultipartFile file, DocumentRequestDTO dto, Long membreId) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));

        String filePath = fileStorageService.uploadFile(file, "documents");

        Document document = Document.builder()
                .nom(dto.getNom() != null ? dto.getNom() : file.getOriginalFilename())
                .description(dto.getDescription())
                .cheminFichier(filePath)
                .typeDocument(dto.getTypeDocument() != null ? dto.getTypeDocument() : TypeDocument.AUTRE)
                .dateUpload(LocalDateTime.now())
                .uploadePar(membre)
                .taille(file.getSize())
                .mimeType(file.getContentType())
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

        // Notify all active members about the new document
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

        return saved;
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
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
