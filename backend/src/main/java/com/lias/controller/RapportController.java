package com.lias.controller;

import com.lias.dto.response.RapportAnnuelDTO;
import com.lias.security.UserPrincipal;
import com.lias.service.RapportAnnuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rapports")
@RequiredArgsConstructor
public class RapportController {

    private final RapportAnnuelService rapportService;

    @GetMapping
    public ResponseEntity<List<RapportAnnuelDTO>> getAllRapports() {
        return ResponseEntity.ok(rapportService.getRapports());
    }

    @PostMapping("/generer")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<RapportAnnuelDTO> genererRapport(@RequestParam Integer annee,
                                                            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(rapportService.genererRapport(annee, user.getMembreId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RapportAnnuelDTO> getRapportById(@PathVariable Long id) {
        return ResponseEntity.ok(rapportService.getRapportById(id));
    }

    @GetMapping("/{id}/export-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdf = rapportService.exportRapportPDF(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=rapport-annuel.pdf")
                .body(pdf);
    }
}
