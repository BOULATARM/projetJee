package com.lias.service.impl;

import com.lias.dto.request.DiscussionRequestDTO;
import com.lias.entity.Discussion;
import com.lias.entity.Equipe;
import com.lias.entity.Evenement;
import com.lias.entity.Membre;
import com.lias.entity.ReponseDiscussion;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.*;
import com.lias.service.DiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscussionServiceImpl implements DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final ReponseDiscussionRepository reponseRepository;
    private final MembreRepository membreRepository;
    private final EquipeRepository equipeRepository;
    private final EvenementRepository evenementRepository;

    @Override
    public List<Discussion> getDiscussionsByEquipe(Long equipeId) {
        return discussionRepository.findByEquipeId(equipeId);
    }

    @Override
    public List<Discussion> getDiscussionsByEvenement(Long evenementId) {
        return discussionRepository.findByEvenementId(evenementId);
    }

    @Override
    @Transactional
    public Discussion creerDiscussion(DiscussionRequestDTO dto, Long auteurId) {
        Membre auteur = membreRepository.findById(auteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", auteurId));

        Discussion discussion = Discussion.builder()
                .sujet(dto.getSujet())
                .contenu(dto.getContenu())
                .auteur(auteur)
                .dateCreation(LocalDateTime.now())
                .build();

        if (dto.getEquipeId() != null) {
            Equipe equipe = equipeRepository.findById(dto.getEquipeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipe", "id", dto.getEquipeId()));
            discussion.setEquipe(equipe);
        }
        if (dto.getEvenementId() != null) {
            Evenement evenement = evenementRepository.findById(dto.getEvenementId())
                    .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", dto.getEvenementId()));
            discussion.setEvenement(evenement);
        }

        return discussionRepository.save(discussion);
    }

    @Override
    @Transactional
    public ReponseDiscussion ajouterReponse(Long discussionId, String contenu, Long auteurId) {
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResourceNotFoundException("Discussion", "id", discussionId));
        Membre auteur = membreRepository.findById(auteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", auteurId));

        ReponseDiscussion reponse = ReponseDiscussion.builder()
                .contenu(contenu)
                .auteur(auteur)
                .dateCreation(LocalDateTime.now())
                .discussion(discussion)
                .build();

        return reponseRepository.save(reponse);
    }
}
