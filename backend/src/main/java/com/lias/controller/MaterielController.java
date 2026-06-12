package com.lias.controller;

import com.lias.dto.request.DistributionRequestDTO;
import com.lias.dto.request.MaterielRequestDTO;
import com.lias.entity.DistributionMateriel;
import com.lias.entity.Materiel;
import com.lias.entity.MaterielHistorique;
import com.lias.entity.Membre;
import com.lias.security.UserPrincipal;
import com.lias.service.MaterielService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materiels")
@RequiredArgsConstructor
public class MaterielController {

    private final MaterielService materielService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Materiel>> getAllMateriels() {
        return ResponseEntity.ok(materielService.getMaterielStock());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Materiel> createMateriel(@Valid @RequestBody MaterielRequestDTO dto,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(materielService.ajouterMateriel(dto, user.getMembreId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Materiel> updateMateriel(@PathVariable Long id,
                                                    @Valid @RequestBody MaterielRequestDTO dto,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(materielService.updateMateriel(id, dto, user.getMembreId()));
    }

    @GetMapping("/sans-distribution")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<List<Membre>> getMembresSansDistribution() {
        return ResponseEntity.ok(materielService.getMembresSansDistribution());
    }

    @PostMapping("/distribuer")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> distribuerMateriel(@Valid @RequestBody DistributionRequestDTO dto,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        materielService.distribuerMateriel(dto, user.getMembreId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<List<Materiel>> getStock() {
        return ResponseEntity.ok(materielService.getMaterielStock());
    }

    @GetMapping("/historique")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<List<DistributionMateriel>> getHistorique() {
        return ResponseEntity.ok(materielService.getHistoriqueDistribution());
    }

    @GetMapping("/{id}/historique")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<List<MaterielHistorique>> getHistoriqueMateriel(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.getHistoriqueMateriel(id));
    }

    @GetMapping("/{id}/beneficiaires")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<List<Membre>> getBeneficiaires(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.getMembresAyantRecu(id));
    }

    @GetMapping("/{id}/non-beneficiaires")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<List<Membre>> getNonBeneficiaires(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.getMembresNAyantPasRecu(id));
    }
}
