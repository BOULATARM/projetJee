package com.lias.controller;

import com.lias.dto.request.DemandeDocumentRequestDTO;
import com.lias.entity.DemandeDocument;
import com.lias.enums.StatutDemande;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DemandeDocumentRepository;
import com.lias.repository.MembreRepository;
import com.lias.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/demandes-document")
@RequiredArgsConstructor
public class DemandeDocumentController {

    private final DemandeDocumentRepository repository;
    private final MembreRepository membreRepository;

    /** Membre soumet une demande */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DemandeDocument> soumettre(
            @RequestBody DemandeDocumentRequestDTO dto,
            @AuthenticationPrincipal UserPrincipal user) {

        DemandeDocument demande = DemandeDocument.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .typeDocument(dto.getTypeDocument())
                .statut(StatutDemande.PENDING)
                .dateCreation(LocalDateTime.now())
                .demandeur(membreRepository.findById(user.getMembreId())
                        .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", user.getMembreId())))
                .build();

        return ResponseEntity.ok(repository.save(demande));
    }

    /** Membre consulte ses propres demandes */
    @GetMapping("/mes-demandes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DemandeDocument>> getMesDemandes(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(repository.findByDemandeurIdOrderByDateCreationDesc(user.getMembreId()));
    }

    /** Directeur consulte toutes les demandes */
    @GetMapping
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<List<DemandeDocument>> getAll() {
        return ResponseEntity.ok(repository.findAllByOrderByDateCreationDesc());
    }

    /** Directeur accepte une demande */
    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<DemandeDocument> accepter(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {

        DemandeDocument d = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeDocument", "id", id));
        d.setStatut(StatutDemande.ACCEPTEE);
        d.setDateTraitement(LocalDateTime.now());
        d.setTraitePar(membreRepository.findById(user.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", user.getMembreId())));
        return ResponseEntity.ok(repository.save(d));
    }

    /** Directeur refuse une demande */
    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<DemandeDocument> refuser(
            @PathVariable Long id,
            @RequestParam(required = false) String motif,
            @AuthenticationPrincipal UserPrincipal user) {

        DemandeDocument d = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeDocument", "id", id));
        d.setStatut(StatutDemande.REFUSEE);
        d.setMotifRefus(motif);
        d.setDateTraitement(LocalDateTime.now());
        d.setTraitePar(membreRepository.findById(user.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", user.getMembreId())));
        return ResponseEntity.ok(repository.save(d));
    }
}
