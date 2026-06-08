package com.lias.controller;

import com.lias.entity.Mandat;
import com.lias.service.MandatService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mandats")
@RequiredArgsConstructor
public class MandatController {

    private final MandatService mandatService;

    @GetMapping("/actif")
    public ResponseEntity<Mandat> getMandatActif() {
        return ResponseEntity.ok(mandatService.getMandatActif());
    }

    @GetMapping("/historique")
    public ResponseEntity<List<Mandat>> getHistorique() {
        return ResponseEntity.ok(mandatService.getHistoriqueMandats());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Mandat> creerMandat(@RequestParam Long directeurId,
                                               @RequestParam(required = false) Long viceDirecteurId,
                                               @RequestParam LocalDate dateDebut) {
        return ResponseEntity.ok(mandatService.creerMandat(directeurId, viceDirecteurId, dateDebut));
    }

    @PutMapping("/{id}/cloture")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cloturerMandat(@PathVariable Long id, @RequestParam LocalDate dateFin) {
        mandatService.cloturerMandat(id, dateFin);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/chefs-equipe")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Mandat> setChefsEquipe(@PathVariable Long id, @RequestBody List<Long> membreIds) {
        return ResponseEntity.ok(mandatService.setChefsEquipe(id, membreIds));
    }
}
