package com.lias.controller;

import com.lias.dto.request.DemandeMaterielRequestDTO;
import com.lias.entity.DemandeMateriel;
import com.lias.security.UserPrincipal;
import com.lias.service.DemandeMaterielService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/demandes-materiel")
@RequiredArgsConstructor
public class DemandeMaterielController {

    private final DemandeMaterielService demandeMaterielService;

    @PostMapping
    @PreAuthorize("isAuthenticated() and !hasAuthority('STATUT_RETRAITE') and !hasAuthority('STATUT_ANCIEN')")
    public ResponseEntity<DemandeMateriel> createDemande(@RequestBody DemandeMaterielRequestDTO dto,
                                                          @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(demandeMaterielService.creerDemande(dto, user.getMembreId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<List<DemandeMateriel>> getAllDemandes() {
        return ResponseEntity.ok(demandeMaterielService.getAllDemandes());
    }

    @GetMapping("/mes-demandes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DemandeMateriel>> getMesDemandes(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(demandeMaterielService.getDemandesByMembre(user.getMembreId()));
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> validerDemande(@PathVariable Long id,
                                                @AuthenticationPrincipal UserPrincipal user) {
        demandeMaterielService.validerDemande(id, user.getMembreId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> refuserDemande(@PathVariable Long id,
                                                @AuthenticationPrincipal UserPrincipal user) {
        demandeMaterielService.refuserDemande(id, user.getMembreId());
        return ResponseEntity.ok().build();
    }
}
