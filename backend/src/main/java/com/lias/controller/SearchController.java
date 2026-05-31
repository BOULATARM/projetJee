package com.lias.controller;

import com.lias.dto.response.SearchResultDTO;
import com.lias.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final MembreRepository membreRepository;
    private final PublicationRepository publicationRepository;
    private final EvenementRepository evenementRepository;
    private final DocumentRepository documentRepository;
    private final EquipeRepository equipeRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SearchResultDTO>> search(@RequestParam String q,
                                                         @RequestParam(required = false) String type) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        String keyword = q.trim();
        List<SearchResultDTO> results = new ArrayList<>();

        if (type == null || type.equals("MEMBRE")) {
            membreRepository.findByNomContainingOrPrenomContaining(keyword, keyword)
                    .stream().limit(10).forEach(m -> results.add(SearchResultDTO.builder()
                            .type("MEMBRE")
                            .id(m.getId())
                            .titre(m.getPrenom() + " " + m.getNom())
                            .description(m.getStatut() != null ? m.getStatut().name() : "")
                            .url("/dashboard/membres/" + m.getId())
                            .build()));
        }

        if (type == null || type.equals("PUBLICATION")) {
            publicationRepository.findByTitreContainingIgnoreCase(keyword)
                    .stream().limit(10).forEach(p -> results.add(SearchResultDTO.builder()
                            .type("PUBLICATION")
                            .id(p.getId())
                            .titre(p.getTitre())
                            .description(p.getAnnee() != null ? p.getAnnee().toString() : "")
                            .url("/dashboard/publications")
                            .build()));
        }

        if (type == null || type.equals("EVENEMENT")) {
            evenementRepository.findByTitreContainingIgnoreCase(keyword)
                    .stream().limit(10).forEach(e -> results.add(SearchResultDTO.builder()
                            .type("EVENEMENT")
                            .id(e.getId())
                            .titre(e.getTitre())
                            .description(e.getDescription() != null ? e.getDescription() : "")
                            .date(e.getDateDebut() != null ? e.getDateDebut().toLocalDate().toString() : null)
                            .url("/dashboard/evenements")
                            .build()));
        }

        if (type == null || type.equals("DOCUMENT")) {
            documentRepository.findByNomContainingIgnoreCase(keyword)
                    .stream().limit(10).forEach(d -> results.add(SearchResultDTO.builder()
                            .type("DOCUMENT")
                            .id(d.getId())
                            .titre(d.getNom())
                            .description(d.getDescription() != null ? d.getDescription() : "")
                            .url("/dashboard/documents")
                            .build()));
        }

        if (type == null || type.equals("EQUIPE")) {
            equipeRepository.findByNomContainingIgnoreCase(keyword)
                    .stream().limit(5).forEach(eq -> results.add(SearchResultDTO.builder()
                            .type("EQUIPE")
                            .id(eq.getId())
                            .titre(eq.getNom())
                            .description(eq.getDescription() != null ? eq.getDescription() : "")
                            .url("/dashboard/equipes/" + eq.getId())
                            .build()));
        }

        return ResponseEntity.ok(results);
    }
}
