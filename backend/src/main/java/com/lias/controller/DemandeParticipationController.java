package com.lias.controller;

import com.lias.entity.DemandeParticipation;
import com.lias.entity.Evenement;
import com.lias.entity.Membre;
import com.lias.enums.StatutDemande;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DemandeParticipationRepository;
import com.lias.repository.EvenementRepository;
import com.lias.repository.MembreRepository;
import com.lias.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/participations")
@RequiredArgsConstructor
public class DemandeParticipationController {

    private final DemandeParticipationRepository participationRepo;
    private final EvenementRepository evenementRepo;
    private final MembreRepository membreRepo;

    /** Mes demandes de participation */
    @GetMapping("/mes-demandes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DemandeParticipation>> getMesDemandes(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(participationRepo.findByMembreId(user.getMembreId()));
    }

    /** Toutes les demandes (directeur/admin) */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<List<DemandeParticipation>> getAll() {
        return ResponseEntity.ok(participationRepo.findAll());
    }

    /** Demandes d'un événement précis */
    @GetMapping("/evenement/{evenementId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<List<DemandeParticipation>> getByEvenement(
            @PathVariable Long evenementId) {
        return ResponseEntity.ok(participationRepo.findByEvenementId(evenementId));
    }

    /** Soumettre une demande de participation */
    @PostMapping("/evenement/{evenementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> soumettre(
            @PathVariable Long evenementId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal user) {

        // Vérifier doublon
        if (participationRepo.findByMembreIdAndEvenementId(user.getMembreId(), evenementId).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vous avez déjà soumis une demande pour cet événement."));
        }

        Evenement evenement = evenementRepo.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", evenementId));
        Membre membre = membreRepo.findById(user.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", user.getMembreId()));

        DemandeParticipation dp = DemandeParticipation.builder()
                .membre(membre)
                .evenement(evenement)
                .statut(StatutDemande.PENDING)
                .dateDemande(LocalDateTime.now())
                .commentaire(body != null ? body.get("commentaire") : null)
                .build();

        return ResponseEntity.ok(participationRepo.save(dp));
    }

    /** Accepter une demande */
    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<DemandeParticipation> accepter(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {

        DemandeParticipation dp = participationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeParticipation", "id", id));
        Membre directeur = membreRepo.findById(user.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", user.getMembreId()));

        dp.setStatut(StatutDemande.ACCEPTEE);
        dp.setDateDecision(LocalDateTime.now());
        dp.setDecidePar(directeur);
        return ResponseEntity.ok(participationRepo.save(dp));
    }

    /** Refuser une demande */
    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<DemandeParticipation> refuser(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal user) {

        DemandeParticipation dp = participationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeParticipation", "id", id));
        Membre directeur = membreRepo.findById(user.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", user.getMembreId()));

        dp.setStatut(StatutDemande.REFUSEE);
        dp.setDateDecision(LocalDateTime.now());
        dp.setDecidePar(directeur);
        dp.setCommentaire(body != null ? body.get("commentaire") : null);
        return ResponseEntity.ok(participationRepo.save(dp));
    }
}
