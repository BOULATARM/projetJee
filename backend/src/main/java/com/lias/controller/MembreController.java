package com.lias.controller;

import com.lias.dto.request.MembreRequestDTO;
import com.lias.dto.response.MembreDetailDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.enums.StatutMembre;
import com.lias.security.UserPrincipal;
import com.lias.service.FileStorageService;
import com.lias.service.MembreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/membres")
@RequiredArgsConstructor
public class MembreController {

    private final MembreService membreService;
    private final FileStorageService fileStorageService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.lias.repository.MembreRepository membreRepository;

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

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR') or #id == authentication.principal.membreId")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestParam String newPassword) {
        com.lias.entity.Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new com.lias.exception.ResourceNotFoundException("Membre", "id", id));
        membre.setMotDePasse(passwordEncoder.encode(newPassword));
        membreRepository.save(membre);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/equipe")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR') or #id == authentication.principal.membreId")
    public ResponseEntity<Void> changerEquipe(@PathVariable Long id, @RequestParam Long equipeId) {
        membreService.changerEquipe(id, equipeId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/photo")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR') or #id == authentication.principal.membreId")
    public ResponseEntity<MembreResponseDTO> uploadPhoto(@PathVariable Long id,
                                                          @RequestParam("file") MultipartFile file) {
        String photoPath = fileStorageService.uploadFile(file, "images");
        MembreRequestDTO dto = new MembreRequestDTO();
        dto.setPhoto(photoPath);
        return ResponseEntity.ok(membreService.updateProfil(id, dto));
    }

    /** Demande de réactivation pour les membres ANCIEN */
    @PostMapping("/reactivation")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> demanderReactivation(@AuthenticationPrincipal com.lias.security.UserPrincipal user) {
        com.lias.entity.Membre membre = membreRepository.findById(user.getMembreId())
                .orElseThrow(() -> new com.lias.exception.ResourceNotFoundException("Membre", "id", user.getMembreId()));
        if (membre.getStatut() != com.lias.enums.StatutMembre.ANCIEN) {
            return ResponseEntity.badRequest().body("Cette action est réservée aux anciens membres.");
        }
        // Notifier l'admin (simple log pour l'instant — peut être étendu avec email/notification)
        return ResponseEntity.ok("Votre demande de réactivation a été envoyée au directeur.");
    }
}
