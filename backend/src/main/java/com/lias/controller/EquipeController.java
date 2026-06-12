package com.lias.controller;

import com.lias.dto.request.EquipeRequestDTO;
import com.lias.entity.AffiliationMembre;
import com.lias.entity.Equipe;
import com.lias.entity.EquipeHistorique;
import com.lias.repository.AffiliationMembreRepository;
import com.lias.repository.EquipeHistoriqueRepository;
import com.lias.repository.EquipeRepository;
import com.lias.service.EquipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.lias.security.UserPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/equipes")
@RequiredArgsConstructor
public class EquipeController {

    private final EquipeService equipeService;
    private final AffiliationMembreRepository affiliationRepository;
    private final EquipeRepository equipeRepository;
    private final EquipeHistoriqueRepository equipeHistoriqueRepository;

    private boolean isChefOfEquipe(Long equipeId, Long membreId) {
        return equipeRepository.findById(equipeId)
                .map(e -> e.getChefEquipe() != null && e.getChefEquipe().getId().equals(membreId))
                .orElse(false);
    }

    private boolean canManageEquipe(Long equipeId, UserPrincipal user) {
        boolean isPrivileged = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DIRECTEUR") || a.getAuthority().equals("ROLE_ADMIN"));
        return isPrivileged || isChefOfEquipe(equipeId, user.getMembreId());
    }

    @GetMapping
    public ResponseEntity<List<Equipe>> getAllEquipes() {
        return ResponseEntity.ok(equipeService.getAllEquipes());
    }

    @GetMapping("/mes-equipes")
    public ResponseEntity<List<Equipe>> getMesEquipes(@AuthenticationPrincipal UserPrincipal user) {
        List<Equipe> equipes = affiliationRepository
                .findByMembreIdOrderByDateDebutDesc(user.getMembreId())
                .stream()
                .filter(a -> Boolean.TRUE.equals(a.getActif()))
                .map(AffiliationMembre::getEquipe)
                .distinct()
                .toList();
        return ResponseEntity.ok(equipes);
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
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE')")
    public ResponseEntity<Equipe> createEquipeComplet(@RequestBody EquipeRequestDTO dto) {
        return ResponseEntity.ok(equipeService.creerEquipeComplet(dto));
    }

    @GetMapping("/{id}/membres")
    public ResponseEntity<List<com.lias.dto.response.MembreResponseDTO>> getMembresEquipe(
            @PathVariable Long id) {
        return ResponseEntity.ok(equipeService.getMembresActifs(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipe> updateEquipe(@PathVariable Long id,
                                                @RequestParam(required = false) String nom,
                                                @RequestParam(required = false) String description,
                                                @AuthenticationPrincipal UserPrincipal user) {
        if (!canManageEquipe(id, user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(equipeService.updateEquipe(id, nom, description));
    }

    @PostMapping("/{id}/membres")
    public ResponseEntity<Void> ajouterMembre(@PathVariable Long id,
                                               @RequestParam Long membreId,
                                               @RequestParam(required = false) LocalDate dateDebut,
                                               @AuthenticationPrincipal UserPrincipal user) {
        if (!canManageEquipe(id, user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        equipeService.affecterMembre(membreId, id, dateDebut != null ? dateDebut : LocalDate.now());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/membres/{membreId}")
    public ResponseEntity<Void> retirerMembre(@PathVariable Long id,
                                               @PathVariable Long membreId,
                                               @RequestParam(required = false) LocalDate dateFin,
                                               @AuthenticationPrincipal UserPrincipal user) {
        if (!canManageEquipe(id, user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        equipeService.retirerMembre(membreId, id, dateFin != null ? dateFin : LocalDate.now());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/chef")
    public ResponseEntity<Equipe> changerChef(@PathVariable Long id,
                                               @RequestParam Long chefId,
                                               @AuthenticationPrincipal UserPrincipal user) {
        if (!canManageEquipe(id, user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(equipeService.changerChefEquipe(id, chefId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipe(@PathVariable Long id,
                                              @AuthenticationPrincipal UserPrincipal user) {
        if (!canManageEquipe(id, user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        equipeService.supprimerEquipe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/affiliations")
    public ResponseEntity<List<AffiliationMembre>> getAffiliations(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.getAffiliationsByEquipe(id));
    }

    @GetMapping("/{id}/historique")
    public ResponseEntity<List<EquipeHistorique>> getHistorique(@PathVariable Long id) {
        return ResponseEntity.ok(equipeHistoriqueRepository.findByEquipeIdOrderByDateDesc(id));
    }
}
