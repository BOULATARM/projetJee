package com.lias.service;

import com.lias.dto.request.DiscussionRequestDTO;
import com.lias.entity.Discussion;
import com.lias.entity.ReponseDiscussion;
import java.util.List;

public interface DiscussionService {
    List<Discussion> getDiscussionsByEquipe(Long equipeId);
    List<Discussion> getDiscussionsByEvenement(Long evenementId);
    Discussion creerDiscussion(DiscussionRequestDTO dto, Long auteurId);
    ReponseDiscussion ajouterReponse(Long discussionId, String contenu, Long auteurId);
}
