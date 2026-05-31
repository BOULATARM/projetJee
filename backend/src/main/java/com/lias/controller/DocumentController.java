package com.lias.controller;

import com.lias.dto.request.DocumentRequestDTO;
import com.lias.entity.Document;
import com.lias.security.UserPrincipal;
import com.lias.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(@RequestParam("file") MultipartFile file,
                                                   @RequestParam(required = false) String nom,
                                                   @RequestParam(required = false) String description,
                                                   @RequestParam(required = false) String typeDocument,
                                                   @RequestParam(required = false) Long evenementId,
                                                   @RequestParam(required = false) Long reunionId,
                                                   @RequestParam(required = false) Long conventionId,
                                                   @AuthenticationPrincipal UserPrincipal user) {
        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setNom(nom);
        dto.setDescription(description);
        if (typeDocument != null) dto.setTypeDocument(com.lias.enums.TypeDocument.valueOf(typeDocument));
        dto.setEvenementId(evenementId);
        dto.setReunionId(reunionId);
        dto.setConventionId(conventionId);
        return ResponseEntity.ok(documentService.uploadDocument(file, dto, user.getMembreId()));
    }

    @GetMapping("/evenement/{evenementId}")
    public ResponseEntity<List<Document>> getDocumentsByEvenement(@PathVariable Long evenementId) {
        return ResponseEntity.ok(documentService.getDocumentsByEvenement(evenementId));
    }

    @GetMapping("/reunion/{reunionId}")
    public ResponseEntity<List<Document>> getDocumentsByReunion(@PathVariable Long reunionId) {
        return ResponseEntity.ok(documentService.getDocumentsByReunion(reunionId));
    }

    @GetMapping("/convention/{conventionId}")
    public ResponseEntity<List<Document>> getDocumentsByConvention(@PathVariable Long conventionId) {
        return ResponseEntity.ok(documentService.getDocumentsByConvention(conventionId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Resource resource = documentService.downloadDocument(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
}
