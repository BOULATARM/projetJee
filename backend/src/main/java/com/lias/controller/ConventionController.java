package com.lias.controller;

import com.lias.dto.request.ConventionRequestDTO;
import com.lias.entity.ActiviteConvention;
import com.lias.entity.Convention;
import com.lias.service.ConventionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conventions")
@RequiredArgsConstructor
public class ConventionController {

    private final ConventionService conventionService;

    @GetMapping
    public ResponseEntity<List<Convention>> getAllConventions() {
        return ResponseEntity.ok(conventionService.getAllConventions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Convention> getConventionById(@PathVariable Long id) {
        return ResponseEntity.ok(conventionService.getConventionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR')")
    public ResponseEntity<Convention> createConvention(@Valid @RequestBody ConventionRequestDTO dto) {
        return ResponseEntity.ok(conventionService.creerConvention(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR')")
    public ResponseEntity<Convention> updateConvention(@PathVariable Long id,
                                                        @Valid @RequestBody ConventionRequestDTO dto) {
        return ResponseEntity.ok(conventionService.updateConvention(id, dto));
    }

    @PostMapping("/{id}/activites")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR')")
    public ResponseEntity<Void> ajouterActivite(@PathVariable Long id,
                                                 @RequestBody ActiviteConvention activite) {
        conventionService.ajouterActivite(id, activite);
        return ResponseEntity.ok().build();
    }
}
