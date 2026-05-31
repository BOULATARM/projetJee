package com.lias.controller;

import com.lias.dto.request.MembreRequestDTO;
import com.lias.dto.response.MembreDetailDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.enums.StatutMembre;
import com.lias.security.UserPrincipal;
import com.lias.service.MembreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/membres")
@RequiredArgsConstructor
public class MembreController {

    private final MembreService membreService;

    @GetMapping
    public ResponseEntity<List<MembreResponseDTO>> getAllMembres() {
        return ResponseEntity.ok(membreService.getAllMembres());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembreDetailDTO> getMembreById(@PathVariable Long id) {
        return ResponseEntity.ok(membreService.getMembreById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MembreResponseDTO>> searchMembres(@RequestParam String q) {
        return ResponseEntity.ok(membreService.searchMembres(q));
    }

    @GetMapping("/equipe/{equipeId}")
    public ResponseEntity<List<MembreResponseDTO>> getMembresByEquipe(@PathVariable Long equipeId) {
        return ResponseEntity.ok(membreService.getMembresParEquipe(equipeId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR') or #id == authentication.principal.membreId")
    public ResponseEntity<MembreResponseDTO> updateMembre(@PathVariable Long id,
                                                           @Valid @RequestBody MembreRequestDTO dto) {
        return ResponseEntity.ok(membreService.updateProfil(id, dto));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> changeStatut(@PathVariable Long id, @RequestParam StatutMembre statut) {
        membreService.changeStatut(id, statut);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMembre(@PathVariable Long id) {
        membreService.desactiverCompte(id);
        return ResponseEntity.ok().build();
    }
}
