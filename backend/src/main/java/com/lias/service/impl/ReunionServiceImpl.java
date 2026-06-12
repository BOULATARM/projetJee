package com.lias.service.impl;

import com.lias.dto.request.ReunionRequestDTO;
import com.lias.entity.Document;
import com.lias.entity.Membre;
import com.lias.entity.ParticipantReunion;
import com.lias.entity.Reunion;
import com.lias.enums.StatutDocument;
import com.lias.enums.StatutReunion;
import com.lias.enums.TypeDocument;
import com.lias.enums.TypeNotification;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DocumentRepository;
import com.lias.repository.MembreRepository;
import com.lias.repository.ParticipantReunionRepository;
import com.lias.repository.ReunionRepository;
import com.lias.service.FileStorageService;
import com.lias.service.NotificationService;
import com.lias.service.ReunionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReunionServiceImpl implements ReunionService {

    private final ReunionRepository reunionRepository;
    private final MembreRepository membreRepository;
    private final ParticipantReunionRepository participantRepository;
    private final DocumentRepository documentRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    @Override
    public List<Reunion> getAllReunions() {
        return reunionRepository.findAll();
    }

    @Override
    public Reunion getReunionById(Long id) {
        return reunionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", id));
    }

    @Override
    @Transactional
    public Reunion creerReunion(ReunionRequestDTO dto, Long creeParId) {
        Membre creePar = membreRepository.findById(creeParId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", creeParId));

        Reunion reunion = Reunion.builder()
                .titre(dto.getTitre())
                .dateReunion(dto.getDateReunion())
                .lieu(dto.getLieu())
                .ordreJour(dto.getOrdreJour())
                .statut(StatutReunion.PLANIFIEE)
                .creePar(creePar)
                .participants(new ArrayList<>())
                .build();

        if (dto.getParticipantIds() != null) {
            dto.getParticipantIds().forEach(pid -> {
                Membre m = membreRepository.findById(pid)
                        .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", pid));
                ParticipantReunion pr = ParticipantReunion.builder()
                        .reunion(reunion)
                        .membre(m)
                        .build();
                reunion.getParticipants().add(pr);
            });
        }

        Reunion saved = reunionRepository.save(reunion);

        // Notify each participant about the new meeting
        if (dto.getParticipantIds() != null) {
            String message = "Vous avez été convié(e) à la réunion \"" + dto.getTitre() + "\" le "
                    + dto.getDateReunion() + (dto.getLieu() != null ? " au " + dto.getLieu() : "") + ".";
            dto.getParticipantIds().forEach(pid ->
                    notificationService.envoyerNotification(pid, message, TypeNotification.REUNION)
            );
        }

        return saved;
    }

    @Override
    @Transactional
    public void uploadPV(Long reunionId, MultipartFile file, Long membreId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", reunionId));
        String path = fileStorageService.uploadFile(file, "pv");
        reunion.setPvPath(path);
        reunionRepository.save(reunion);

        // Enregistrer aussi comme Document lié à la réunion
        Membre uploader = membreRepository.findById(membreId).orElse(null);
        boolean alreadySaved = documentRepository.findByReunionId(reunionId).stream()
                .anyMatch(d -> d.getTypeDocument() == TypeDocument.PV_REUNION);
        if (!alreadySaved) {
            Document doc = Document.builder()
                    .nom("PV - " + reunion.getTitre())
                    .typeDocument(TypeDocument.PV_REUNION)
                    .cheminFichier(path)
                    .reunion(reunion)
                    .uploadePar(uploader)
                    .dateUpload(java.time.LocalDateTime.now())
                    .statut(StatutDocument.APPROUVE)
                    .mimeType("application/pdf")
                    .taille(file.getSize())
                    .build();
            documentRepository.save(doc);
        }
    }

    @Override
    public Resource downloadPV(Long reunionId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", reunionId));
        if (reunion.getPvPath() == null) {
            throw new RuntimeException("Aucun PV disponible pour cette réunion");
        }
        return fileStorageService.loadFileAsResource(reunion.getPvPath());
    }

    @Override
    @Transactional
    public void marquerPresence(Long reunionId, Long membreId, Boolean present) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", reunionId));
        reunion.getParticipants().stream()
                .filter(p -> p.getMembre().getId().equals(membreId))
                .findFirst()
                .ifPresent(p -> {
                    p.setPresent(present);
                    participantRepository.save(p);
                });
    }

    @Override
    public List<ParticipantReunion> getParticipants(Long reunionId) {
        return participantRepository.findByReunionId(reunionId);
    }

    @Override
    @Transactional
    public void ajouterParticipant(Long reunionId, Long membreId) {
        if (participantRepository.existsByReunionIdAndMembreId(reunionId, membreId)) return;
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", reunionId));
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));
        ParticipantReunion pr = ParticipantReunion.builder()
                .reunion(reunion)
                .membre(membre)
                .present(false)
                .build();
        participantRepository.save(pr);
        String message = "Vous avez été convié(e) à la réunion \"" + reunion.getTitre() + "\" le "
                + reunion.getDateReunion() + (reunion.getLieu() != null ? " au " + reunion.getLieu() : "") + ".";
        notificationService.envoyerNotification(membreId, message, TypeNotification.REUNION);
    }

    @Override
    @Transactional
    public void retirerParticipant(Long reunionId, Long membreId) {
        participantRepository.deleteByReunionIdAndMembreId(reunionId, membreId);
    }
}
