package com.lias.controller;

import com.lias.dto.request.LaboratoireRequestDTO;
import com.lias.entity.AuditLog;
import com.lias.entity.Laboratoire;
import com.lias.entity.Membre;
import com.lias.repository.MembreRepository;
import com.lias.service.AuditLogService;
import com.lias.service.LaboratoireService;
import jakarta.validation.Valid;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/laboratoire")
@RequiredArgsConstructor
public class LaboratoireController {

    private final LaboratoireService laboratoireService;
    private final AuditLogService auditLogService;
    private final MembreRepository membreRepository;

    @Data
    @Builder
    static class HistoriqueDTO {
        private Long id;
        private String action;
        private String utilisateur;
        private String nomComplet;
        private LocalDateTime date;
        private String details;
    }

    @GetMapping
    public ResponseEntity<Laboratoire> getLaboratoire() {
        return ResponseEntity.ok(laboratoireService.getLaboratoire());
    }

    @PutMapping
    @PreAuthorize("hasRole('DIRECTEUR')")
    public ResponseEntity<Laboratoire> modifierLaboratoire(@Valid @RequestBody LaboratoireRequestDTO dto) {
        return ResponseEntity.ok(laboratoireService.modifierLaboratoire(dto));
    }

    @GetMapping("/historique")
    @PreAuthorize("hasAnyRole('DIRECTEUR', 'ADMIN')")
    public ResponseEntity<List<HistoriqueDTO>> getHistorique() {
        List<AuditLog> logs = auditLogService.getByEntite("Laboratoire");

        // Récupérer tous les membreIds distincts pour faire un seul batch
        Map<Long, Membre> membresMap = logs.stream()
                .filter(l -> l.getMembreId() != null)
                .map(AuditLog::getMembreId)
                .distinct()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> membreRepository.findById(id).orElse(null),
                        (a, b) -> a
                ));

        List<HistoriqueDTO> result = logs.stream().map(log -> {
            String nomComplet = null;
            if (log.getMembreId() != null) {
                Membre m = membresMap.get(log.getMembreId());
                if (m != null) nomComplet = m.getPrenom() + " " + m.getNom();
            }
            return HistoriqueDTO.builder()
                    .id(log.getId())
                    .action(log.getAction())
                    .utilisateur(log.getUtilisateur())
                    .nomComplet(nomComplet)
                    .date(log.getDate())
                    .details(log.getDetails())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
