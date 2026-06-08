package com.lias.controller;

import com.lias.dto.request.PublicationRequestDTO;
import com.lias.dto.response.PublicationResponseDTO;
import com.lias.entity.Publication;
import com.lias.repository.PublicationRepository;
import com.lias.security.UserPrincipal;
import com.lias.service.FileStorageService;
import com.lias.service.PublicationService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/v1/publications")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationService publicationService;
    private final PublicationRepository publicationRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<PublicationResponseDTO>> getAllPublications(
            @RequestParam(required = false) Long auteurId,
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) Long equipeId) {
        if (auteurId != null || annee != null || equipeId != null) {
            return ResponseEntity.ok(publicationService.getAllPublicationsFiltered(auteurId, annee, equipeId));
        }
        return ResponseEntity.ok(publicationService.getAllPublications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicationResponseDTO> getPublicationById(@PathVariable Long id) {
        return ResponseEntity.ok(publicationService.getPublicationById(id));
    }

    /** Ajout publication avec PDF obligatoire (multipart/form-data) */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicationResponseDTO> createPublication(
            @RequestPart("data") String dataJson,
            @RequestPart("fichierPdf") MultipartFile fichierPdf,
            @AuthenticationPrincipal UserPrincipal user) throws Exception {
        PublicationRequestDTO dto = objectMapper.readValue(dataJson, PublicationRequestDTO.class);
        return ResponseEntity.ok(publicationService.ajouterPublication(dto, fichierPdf, user.getMembreId()));
    }

    /** Téléchargement du PDF d'une publication */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long id) {
        Publication pub = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication introuvable"));
        if (pub.getFichierPath() == null) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = fileStorageService.loadFileAsResource(pub.getFichierPath());
        Path filePath = Paths.get(pub.getFichierPath());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filePath.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
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
