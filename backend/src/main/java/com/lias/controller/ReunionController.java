package com.lias.controller;

import com.lias.dto.request.ReunionRequestDTO;
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

    @PostMapping("/{id}/pv")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'CHEF_EQUIPE')")
    public ResponseEntity<Reunion> uploadPV(@PathVariable Long id,
                                             @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(reunionService.uploadPV(id, file));
    }

    @GetMapping("/{id}/pv")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadPV(@PathVariable Long id) {
        Resource resource = reunionService.downloadPV(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"pv-reunion-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
