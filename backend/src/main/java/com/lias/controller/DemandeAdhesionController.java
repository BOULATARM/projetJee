package com.lias.controller;

import com.lias.dto.request.DemandeAdhesionRequestDTO;
import com.lias.entity.DemandeAdhesion;
import com.lias.security.UserPrincipal;
import com.lias.service.DemandeAdhesionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/demandes-adhesion")
@RequiredArgsConstructor
public class DemandeAdhesionController {

    private final DemandeAdhesionService demandeAdhesionService;

    @PostMapping
    public ResponseEntity<DemandeAdhesion> soumettreDemande(@Valid @RequestBody DemandeAdhesionRequestDTO dto) {
        return ResponseEntity.ok(demandeAdhesionService.soumettreDemandePublique(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<List<DemandeAdhesion>> getAllDemandes() {
        return ResponseEntity.ok(demandeAdhesionService.getAllDemandes());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<DemandeAdhesion> getDemandeById(@PathVariable Long id) {
        return ResponseEntity.ok(demandeAdhesionService.getDemandeById(id));
    }

    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> accepterDemande(@PathVariable Long id,
                                                 @AuthenticationPrincipal UserPrincipal user) {
        demandeAdhesionService.accepterDemande(id, user.getMembreId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> refuserDemande(@PathVariable Long id,
                                                @AuthenticationPrincipal UserPrincipal user,
                                                @RequestParam(required = false) String commentaire) {
        demandeAdhesionService.refuserDemande(id, user.getMembreId(), commentaire);
        return ResponseEntity.ok().build();
    }
}
