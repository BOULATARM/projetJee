package com.lias.controller;

import com.lias.dto.request.ReunionRequestDTO;
import com.lias.dto.response.ReunionResponseDTO;
import com.lias.entity.ParticipantReunion;
import com.lias.entity.Reunion;
import com.lias.security.UserPrincipal;
import com.lias.service.ReunionService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reunions")
@RequiredArgsConstructor
public class ReunionController {

    private final ReunionService reunionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReunionResponseDTO>> getAllReunions() {
        List<ReunionResponseDTO> dtos = reunionService.getAllReunions()
                .stream().map(ReunionResponseDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReunionResponseDTO> getReunionById(@PathVariable Long id) {
        return ResponseEntity.ok(ReunionResponseDTO.from(reunionService.getReunionById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<ReunionResponseDTO> createReunion(@Valid @RequestBody ReunionRequestDTO dto,
                                                             @AuthenticationPrincipal UserPrincipal user) {
        Reunion created = reunionService.creerReunion(dto, user.getMembreId());
        return ResponseEntity.ok(ReunionResponseDTO.from(created));
    }

    @GetMapping("/{id}/presences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReunionResponseDTO.ParticipantSimple>> getParticipants(@PathVariable Long id) {
        List<ReunionResponseDTO.ParticipantSimple> list = reunionService.getParticipants(id)
                .stream().map(p -> {
                    ReunionResponseDTO.ParticipantSimple ps = new ReunionResponseDTO.ParticipantSimple();
                    ps.setId(p.getId());
                    ps.setPresent(p.getPresent());
                    if (p.getMembre() != null) {
                        ps.setMembreId(p.getMembre().getId());
                        ps.setPrenom(p.getMembre().getPrenom());
                        ps.setNom(p.getMembre().getNom());
                        ps.setPhoto(p.getMembre().getPhoto());
                    }
                    return ps;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/participants/{membreId}")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> ajouterParticipant(@PathVariable Long id, @PathVariable Long membreId) {
        reunionService.ajouterParticipant(id, membreId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/participants/{membreId}")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> retirerParticipant(@PathVariable Long id, @PathVariable Long membreId) {
        reunionService.retirerParticipant(id, membreId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/presence/{membreId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marquerPresence(@PathVariable Long id, @PathVariable Long membreId,
                                                 @RequestParam Boolean present) {
        reunionService.marquerPresence(id, membreId, present);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/pv")
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Void> uploadPV(@PathVariable Long id,
                                          @RequestParam("file") MultipartFile file,
                                          @AuthenticationPrincipal UserPrincipal user) {
        reunionService.uploadPV(id, file, user.getMembreId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/pv")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadPV(@PathVariable Long id) {
        Resource resource = reunionService.downloadPV(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"pv-reunion-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
