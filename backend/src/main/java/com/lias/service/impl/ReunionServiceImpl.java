package com.lias.service.impl;

import com.lias.dto.request.ReunionRequestDTO;
import com.lias.entity.Membre;
import com.lias.entity.ParticipantReunion;
import com.lias.entity.Reunion;
import com.lias.enums.TypeNotification;
import com.lias.exception.ResourceNotFoundException;
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
    public Reunion uploadPV(Long reunionId, MultipartFile file) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", reunionId));
        String path = fileStorageService.uploadFile(file, "pv");
        reunion.setPvPath(path);
        return reunionRepository.save(reunion);
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
}
