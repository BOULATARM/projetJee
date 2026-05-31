package com.lias.controller;

import com.lias.dto.request.DiscussionRequestDTO;
import com.lias.entity.Discussion;
import com.lias.entity.ReponseDiscussion;
import com.lias.security.UserPrincipal;
import com.lias.service.DiscussionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/discussions")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService discussionService;

    @GetMapping("/equipe/{equipeId}")
    public ResponseEntity<List<Discussion>> getByEquipe(@PathVariable Long equipeId) {
        return ResponseEntity.ok(discussionService.getDiscussionsByEquipe(equipeId));
    }

    @GetMapping("/evenement/{evenementId}")
    public ResponseEntity<List<Discussion>> getByEvenement(@PathVariable Long evenementId) {
        return ResponseEntity.ok(discussionService.getDiscussionsByEvenement(evenementId));
    }

    @PostMapping
    public ResponseEntity<Discussion> createDiscussion(@Valid @RequestBody DiscussionRequestDTO dto,
                                                        @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(discussionService.creerDiscussion(dto, user.getMembreId()));
    }

    @PostMapping("/{id}/reponses")
    public ResponseEntity<ReponseDiscussion> ajouterReponse(@PathVariable Long id,
                                                             @RequestBody String contenu,
                                                             @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(discussionService.ajouterReponse(id, contenu, user.getMembreId()));
    }
}
