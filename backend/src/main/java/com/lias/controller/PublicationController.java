package com.lias.controller;

import com.lias.dto.request.PublicationRequestDTO;
import com.lias.dto.response.PublicationResponseDTO;
import com.lias.security.UserPrincipal;
import com.lias.service.PublicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/publications")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationService publicationService;

    @GetMapping
    public ResponseEntity<List<PublicationResponseDTO>> getAllPublications() {
        return ResponseEntity.ok(publicationService.getAllPublications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicationResponseDTO> getPublicationById(@PathVariable Long id) {
        return ResponseEntity.ok(publicationService.getPublicationById(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicationResponseDTO> createPublication(@Valid @RequestBody PublicationRequestDTO dto,
                                                                     @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(publicationService.ajouterPublication(dto, user.getMembreId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE')")
    public ResponseEntity<PublicationResponseDTO> updatePublication(@PathVariable Long id,
                                                                     @Valid @RequestBody PublicationRequestDTO dto) {
        return ResponseEntity.ok(publicationService.updatePublication(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id) {
        publicationService.deletePublication(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/membre/{membreId}")
    public ResponseEntity<List<PublicationResponseDTO>> getByMembre(@PathVariable Long membreId) {
        return ResponseEntity.ok(publicationService.getPublicationsByMembre(membreId));
    }

    @GetMapping("/equipe/{equipeId}")
    public ResponseEntity<List<PublicationResponseDTO>> getByEquipe(@PathVariable Long equipeId) {
        return ResponseEntity.ok(publicationService.getPublicationsByEquipe(equipeId));
    }

    @GetMapping("/annee/{annee}")
    public ResponseEntity<List<PublicationResponseDTO>> getByAnnee(@PathVariable Integer annee) {
        return ResponseEntity.ok(publicationService.getPublicationsByAnnee(annee));
    }
}
