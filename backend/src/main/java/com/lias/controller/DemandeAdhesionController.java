package com.lias.controller;

import com.lias.dto.request.DemandeAdhesionRequestDTO;
import com.lias.entity.DemandeAdhesion;
import com.lias.security.UserPrincipal;
import com.lias.service.DemandeAdhesionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/demandes-adhesion")
@RequiredArgsConstructor
public class DemandeAdhesionController {

    private final DemandeAdhesionService demandeAdhesionService;
    private final com.lias.repository.DemandeAdhesionRepository demandeAdhesionRepository;

    /**
     * Endpoint public : vérifie le statut d'une demande d'adhésion par email.
     * Utilisé par la page login pour afficher un message approprié.
     */
    @GetMapping("/statut-email")
    public ResponseEntity<Map<String, String>> checkStatutByEmail(@RequestParam String email) {
        return demandeAdhesionRepository.findTopByEmailOrderByDateDepotDesc(email)
                .map(d -> {
                    Map<String, String> result = new java.util.HashMap<>();
                    result.put("statut", d.getStatut().name());
                    result.put("commentaire", d.getCommentaireRefus() != null ? d.getCommentaireRefus() : "");
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    @PostMapping
    public ResponseEntity<DemandeAdhesion> soumettreDemande(@Valid @RequestBody DemandeAdhesionRequestDTO dto) {
        return ResponseEntity.ok(demandeAdhesionService.soumettreDemandePublique(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<List<DemandeAdhesion>> getAllDemandes() {
        return ResponseEntity.ok(demandeAdhesionService.getAllDemandes());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<DemandeAdhesion> getDemandeById(@PathVariable Long id) {
        return ResponseEntity.ok(demandeAdhesionService.getDemandeById(id));
    }

    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> accepterDemande(@PathVariable Long id,
                                                 @RequestParam Long equipeId,
                                                 @AuthenticationPrincipal UserPrincipal user) {
        demandeAdhesionService.accepterDemande(id, user.getMembreId(), equipeId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Void> refuserDemande(@PathVariable Long id,
                                                @AuthenticationPrincipal UserPrincipal user,
                                                @RequestParam(required = false) String commentaire) {
        demandeAdhesionService.refuserDemande(id, user.getMembreId(), commentaire);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cv")
    public ResponseEntity<DemandeAdhesion> uploadCV(@PathVariable Long id,
                                                     @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(demandeAdhesionService.uploadCV(id, file));
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<DemandeAdhesion> uploadPhoto(@PathVariable Long id,
                                                        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(demandeAdhesionService.uploadPhoto(id, file));
    }

    @GetMapping("/{id}/cv")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR')")
    public ResponseEntity<Resource> downloadCV(@PathVariable Long id) {
        Resource resource = demandeAdhesionService.downloadCV(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cv-" + id + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
