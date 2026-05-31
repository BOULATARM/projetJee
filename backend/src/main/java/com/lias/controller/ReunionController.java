package com.lias.controller;

import com.lias.dto.request.ReunionRequestDTO;
import com.lias.entity.Reunion;
import com.lias.security.UserPrincipal;
import com.lias.service.ReunionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reunions")
@RequiredArgsConstructor
public class ReunionController {

    private final ReunionService reunionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Reunion>> getAllReunions() {
        return ResponseEntity.ok(reunionService.getAllReunions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reunion> getReunionById(@PathVariable Long id) {
        return ResponseEntity.ok(reunionService.getReunionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE')")
    public ResponseEntity<Reunion> createReunion(@Valid @RequestBody ReunionRequestDTO dto,
                                                  @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(reunionService.creerReunion(dto, user.getMembreId()));
    }

    @PostMapping("/{id}/presence/{membreId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marquerPresence(@PathVariable Long id, @PathVariable Long membreId,
                                                 @RequestParam Boolean present) {
        reunionService.marquerPresence(id, membreId, present);
        return ResponseEntity.ok().build();
    }
}
