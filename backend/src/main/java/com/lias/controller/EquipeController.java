package com.lias.controller;

import com.lias.dto.request.EquipeRequestDTO;
import com.lias.entity.AffiliationMembre;
import com.lias.entity.Equipe;
import com.lias.service.EquipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/equipes")
@RequiredArgsConstructor
public class EquipeController {

    private final EquipeService equipeService;

    @GetMapping
    public ResponseEntity<List<Equipe>> getAllEquipes() {
        return ResponseEntity.ok(equipeService.getAllEquipes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipe> getEquipeById(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.getEquipeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Equipe> createEquipe(@RequestParam String nom,
                                                @RequestParam(required = false) String description,
                                                @RequestParam(required = false) Long chefEquipeId) {
        return ResponseEntity.ok(equipeService.creerEquipe(nom, description, chefEquipeId));
    }

    @PostMapping("/complet")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Equipe> createEquipeComplet(@RequestBody EquipeRequestDTO dto) {
        return ResponseEntity.ok(equipeService.creerEquipeComplet(dto));
    }

    @GetMapping("/{id}/membres")
    public ResponseEntity<List<com.lias.dto.response.MembreResponseDTO>> getMembresEquipe(
            @PathVariable Long id) {
        return ResponseEntity.ok(equipeService.getMembresActifs(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Equipe> updateEquipe(@PathVariable Long id,
                                                @RequestParam(required = false) String nom,
                                                @RequestParam(required = false) String description) {
        return ResponseEntity.ok(equipeService.updateEquipe(id, nom, description));
    }

    @PostMapping("/{id}/membres")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> ajouterMembre(@PathVariable Long id,
                                               @RequestParam Long membreId,
                                               @RequestParam(required = false) LocalDate dateDebut) {
        equipeService.affecterMembre(membreId, id, dateDebut != null ? dateDebut : LocalDate.now());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/membres/{membreId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> retirerMembre(@PathVariable Long id,
                                               @PathVariable Long membreId,
                                               @RequestParam(required = false) LocalDate dateFin) {
        equipeService.retirerMembre(membreId, id, dateFin != null ? dateFin : LocalDate.now());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/affiliations")
    public ResponseEntity<List<AffiliationMembre>> getAffiliations(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.getAffiliationsByEquipe(id));
    }
}
