package com.lias.controller;

import com.lias.dto.request.EvenementRequestDTO;
import com.lias.dto.response.EvenementResponseDTO;
import com.lias.dto.response.ParticipationDTO;
import com.lias.enums.StatutEvenement;
import com.lias.security.UserPrincipal;
import com.lias.service.EvenementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/evenements")
@RequiredArgsConstructor
public class EvenementController {

    private final EvenementService evenementService;

    @GetMapping
    public ResponseEntity<List<EvenementResponseDTO>> getAllEvenements() {
        return ResponseEntity.ok(evenementService.getAllEvenements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvenementResponseDTO> getEvenementById(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.getEvenementById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<EvenementResponseDTO> createEvenement(@Valid @RequestBody EvenementRequestDTO dto) {
        return ResponseEntity.ok(evenementService.creerEvenement(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<EvenementResponseDTO> updateEvenement(@PathVariable Long id,
                                                                 @Valid @RequestBody EvenementRequestDTO dto) {
        return ResponseEntity.ok(evenementService.updateEvenement(id, dto));
    }

    // Fix : param "role" (était "roleOrganisation" côté frontend → mismatch)
    @PostMapping("/{id}/organisateurs")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> ajouterOrganisateur(@PathVariable Long id,
                                                     @RequestParam Long membreId,
                                                     @RequestParam(required = false, defaultValue = "") String role) {
        evenementService.affecterOrganisateur(id, membreId, role);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> changerStatut(@PathVariable Long id, @RequestParam StatutEvenement statut) {
        evenementService.changerStatut(id, statut);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/calendrier")
    public ResponseEntity<List<EvenementResponseDTO>> getCalendrier(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(evenementService.getEvenementsByDateRange(debut, fin));
    }

    @PutMapping("/{id}/annuler")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> annulerEvenement(@PathVariable Long id) {
        evenementService.annulerEvenement(id);
        return ResponseEntity.ok().build();
    }

    // ─── Participation ────────────────────────────────────────────────────────

    @PostMapping("/{id}/participer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ParticipationDTO> participer(@PathVariable Long id,
                                                        @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(evenementService.participer(id, user.getMembreId()));
    }

    @GetMapping("/{id}/participations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ParticipationDTO>> getParticipations(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.getParticipations(id));
    }

    @PutMapping("/{id}/participations/{membreId}/confirmer")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> confirmerParticipation(@PathVariable Long id, @PathVariable Long membreId) {
        evenementService.confirmerParticipation(id, membreId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/participations/{membreId}/refuser")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> refuserParticipation(@PathVariable Long id, @PathVariable Long membreId) {
        evenementService.refuserParticipation(id, membreId);
        return ResponseEntity.ok().build();
    }
}
