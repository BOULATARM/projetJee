package com.lias.controller;

import com.lias.entity.AuditLog;
import com.lias.entity.Mandat;
import com.lias.repository.AuditLogRepository;
import com.lias.security.UserPrincipal;
import com.lias.service.MandatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mandats")
@RequiredArgsConstructor
public class MandatController {

    private final MandatService mandatService;
    private final AuditLogRepository auditLogRepository;

    private static final List<String> ACTIONS_MANDAT = List.of("CREATION_MANDAT", "CLOTURE_MANDAT");

    @GetMapping("/actif")
    public ResponseEntity<Mandat> getMandatActif() {
        try {
            return ResponseEntity.ok(mandatService.getMandatActif());
        } catch (Exception e) {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/historique")
    public ResponseEntity<List<Mandat>> getHistorique() {
        return ResponseEntity.ok(mandatService.getHistoriqueMandats());
    }

    @GetMapping("/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditMandats() {
        return ResponseEntity.ok(auditLogRepository.findByActionInOrderByDateDesc(ACTIONS_MANDAT));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Mandat> creerMandat(
            @RequestParam Long directeurId,
            @RequestParam(required = false) Long viceDirecteurId,
            @AuthenticationPrincipal UserPrincipal admin) {
        return ResponseEntity.ok(mandatService.creerMandat(
                directeurId, viceDirecteurId, LocalDate.now(), admin.getEmail()));
    }

    @PutMapping("/{id}/cloture")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cloturerMandat(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin) {
        mandatService.cloturerMandat(id, LocalDate.now(), admin.getEmail());
        return ResponseEntity.ok().build();
    }
}
