package com.lias.controller;

import com.lias.entity.AuditLog;
import com.lias.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogService.getAll(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AuditLog>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogService.search(q, pageable));
    }

    @GetMapping("/entite/{entite}")
    public ResponseEntity<List<AuditLog>> getByEntite(@PathVariable String entite) {
        return ResponseEntity.ok(auditLogService.getByEntite(entite));
    }

    @GetMapping("/utilisateur/{utilisateur}")
    public ResponseEntity<List<AuditLog>> getByUtilisateur(@PathVariable String utilisateur) {
        return ResponseEntity.ok(auditLogService.getByUtilisateur(utilisateur));
    }
}
