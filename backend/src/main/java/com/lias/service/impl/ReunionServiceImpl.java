package com.lias.service.impl;

import com.lias.dto.request.ReunionRequestDTO;
import com.lias.entity.Membre;
import com.lias.entity.ParticipantReunion;
import com.lias.entity.Reunion;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.MembreRepository;
import com.lias.repository.ParticipantReunionRepository;
import com.lias.repository.ReunionRepository;
import com.lias.service.ReunionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReunionServiceImpl implements ReunionService {

    private final ReunionRepository reunionRepository;
    private final MembreRepository membreRepository;
    private final ParticipantReunionRepository participantRepository;

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

        return reunionRepository.save(reunion);
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
