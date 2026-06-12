package com.lias.controller;

import com.lias.dto.request.ProcesVerbalRequestDTO;
import com.lias.entity.ProcesVerbal;
import com.lias.entity.Reunion;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.ProcesVerbalRepository;
import com.lias.repository.ReunionRepository;
import com.lias.repository.MembreRepository;
import com.lias.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pv")
@RequiredArgsConstructor
public class ProcesVerbalController {

    private final ProcesVerbalRepository pvRepository;
    private final ReunionRepository reunionRepository;
    private final MembreRepository membreRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProcesVerbal>> getAll() {
        return ResponseEntity.ok(pvRepository.findAllByOrderByDateDesc());
    }

    @GetMapping("/reunion/{reunionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProcesVerbal>> getByReunion(@PathVariable Long reunionId) {
        return ResponseEntity.ok(pvRepository.findByReunionIdOrderByDateDesc(reunionId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProcesVerbal> getById(@PathVariable Long id) {
        ProcesVerbal pv = pvRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcesVerbal", "id", id));
        return ResponseEntity.ok(pv);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE')")
    public ResponseEntity<ProcesVerbal> create(@Valid @RequestBody ProcesVerbalRequestDTO dto,
                                                @AuthenticationPrincipal UserPrincipal user) {
        ProcesVerbal pv = new ProcesVerbal();
        pv.setTitre(dto.getTitre());
        pv.setDate(dto.getDate());
        pv.setContenu(dto.getContenu());
        pv.setFichierUrl(dto.getFichierUrl());
        if (dto.getReunionId() != null) {
            Reunion reunion = reunionRepository.findById(dto.getReunionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", dto.getReunionId()));
            pv.setReunion(reunion);
        }
        pv.setRedacteur(membreRepository.findById(user.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", user.getMembreId())));
        return ResponseEntity.ok(pvRepository.save(pv));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR', 'VICE_DIRECTEUR', 'CHEF_EQUIPE')")
    public ResponseEntity<ProcesVerbal> update(@PathVariable Long id,
                                                @Valid @RequestBody ProcesVerbalRequestDTO dto) {
        ProcesVerbal pv = pvRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcesVerbal", "id", id));
        pv.setTitre(dto.getTitre());
        pv.setDate(dto.getDate());
        pv.setContenu(dto.getContenu());
        pv.setFichierUrl(dto.getFichierUrl());
        if (dto.getReunionId() != null) {
            Reunion reunion = reunionRepository.findById(dto.getReunionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reunion", "id", dto.getReunionId()));
            pv.setReunion(reunion);
        }
        return ResponseEntity.ok(pvRepository.save(pv));
    }
}
