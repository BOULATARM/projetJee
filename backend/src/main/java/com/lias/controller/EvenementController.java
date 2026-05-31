package com.lias.controller;

import com.lias.dto.request.EvenementRequestDTO;
import com.lias.dto.response.EvenementResponseDTO;
import com.lias.enums.StatutEvenement;
import com.lias.security.UserPrincipal;
import com.lias.service.EvenementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<EvenementResponseDTO> createEvenement(@Valid @RequestBody EvenementRequestDTO dto) {
        return ResponseEntity.ok(evenementService.creerEvenement(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<EvenementResponseDTO> updateEvenement(@PathVariable Long id,
                                                                 @Valid @RequestBody EvenementRequestDTO dto) {
        return ResponseEntity.ok(evenementService.updateEvenement(id, dto));
    }

    @PostMapping("/{id}/organisateurs")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> ajouterOrganisateur(@PathVariable Long id,
                                                     @RequestParam Long membreId,
                                                     @RequestParam String role) {
        evenementService.affecterOrganisateur(id, membreId, role);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
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
}
