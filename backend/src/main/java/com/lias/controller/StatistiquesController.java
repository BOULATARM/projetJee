package com.lias.controller;

import com.lias.dto.response.DashboardStatsDTO;
import com.lias.entity.Evenement;
import com.lias.entity.Publication;
import com.lias.entity.Membre;
import com.lias.enums.StatutDemande;
import com.lias.enums.StatutMembre;
import com.lias.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatistiquesController {

    private final MembreRepository membreRepository;
    private final PublicationRepository publicationRepository;
    private final EvenementRepository evenementRepository;
    private final EquipeRepository equipeRepository;
    private final ConventionRepository conventionRepository;
    private final DemandeAdhesionRepository demandeAdhesionRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        long nbMembres = membreRepository.count();
        long nbDoctorants = membreRepository.countByStatut(StatutMembre.DOCTORANT);
        long nbPublications = publicationRepository.count();
        List<Evenement> evenements = evenementRepository.findAll();
        long nbEquipes = equipeRepository.count();
        long nbConventionsActives = conventionRepository.findAll().stream()
                .filter(c -> c.getStatut() == com.lias.enums.StatutConvention.ACTIVE)
                .count();
        long nbDemandesEnAttente = demandeAdhesionRepository.findByStatut(StatutDemande.PENDING).size();

        List<Publication> pubs = publicationRepository.findAll();
        Map<String, Long> pubsParAnnee = pubs.stream()
                .collect(Collectors.groupingBy(p -> String.valueOf(p.getAnnee()), Collectors.counting()));

        List<Membre> membres = membreRepository.findAll();
        Map<String, Long> membresParStatut = membres.stream()
                .collect(Collectors.groupingBy(m -> m.getStatut().name(), Collectors.counting()));

        Map<String, Long> evenementsParType = evenements.stream()
                .collect(Collectors.groupingBy(e -> e.getType().name(), Collectors.counting()));

        return ResponseEntity.ok(DashboardStatsDTO.builder()
                .nbMembres(nbMembres)
                .nbPublications(nbPublications)
                .nbEvenements((long) evenements.size())
                .nbDoctorants(nbDoctorants)
                .nbEquipes(nbEquipes)
                .nbConventionsActives(nbConventionsActives)
                .nbDemandesEnAttente(nbDemandesEnAttente)
                .publicationsParAnnee(pubsParAnnee)
                .membresParStatut(membresParStatut)
                .evenementsParType(evenementsParType)
                .build());
    }

    @GetMapping("/publications/par-annee")
    public ResponseEntity<Map<Integer, Long>> getPublicationsByYear() {
        List<Publication> pubs = publicationRepository.findAll();
        Map<Integer, Long> result = pubs.stream()
                .collect(Collectors.groupingBy(Publication::getAnnee, Collectors.counting()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/membres/par-statut")
    public ResponseEntity<Map<String, Long>> getMembresByStatut() {
        List<Membre> membres = membreRepository.findAll();
        Map<String, Long> result = membres.stream()
                .collect(Collectors.groupingBy(m -> m.getStatut().name(), Collectors.counting()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/evenements/par-type")
    public ResponseEntity<Map<String, Long>> getEvenementsByType() {
        List<Evenement> evenements = evenementRepository.findAll();
        Map<String, Long> result = evenements.stream()
                .collect(Collectors.groupingBy(e -> e.getType().name(), Collectors.counting()));
        return ResponseEntity.ok(result);
    }
}
