package com.lias.service.impl;

import com.lias.dto.response.EvenementResponseDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.dto.response.PublicationResponseDTO;
import com.lias.dto.response.RapportAnnuelDTO;
import com.lias.entity.RapportAnnuel;
import com.lias.enums.StatutMembre;
import com.lias.enums.StatutRapport;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.*;
import com.lias.service.RapportAnnuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RapportAnnuelServiceImpl implements RapportAnnuelService {

    private final RapportAnnuelRepository rapportRepository;
    private final MembreRepository membreRepository;
    private final PublicationRepository publicationRepository;
    private final EvenementRepository evenementRepository;
    private final LaboratoireRepository laboratoireRepository;

    @Override
    @Transactional
    public RapportAnnuelDTO genererRapport(Integer annee, Long directeurId) {
        long nbMembres = membreRepository.count();
        long nbDoctorants = membreRepository.countByStatut(StatutMembre.DOCTORANT);
        long nbPublications = publicationRepository.countByAnnee(annee);
        long nbEvenements = evenementRepository.findByAnnee(annee).size();

        var publications = publicationRepository.findByAnnee(annee);
        var evenements = evenementRepository.findByAnnee(annee);
        var membres = membreRepository.findByActiveTrue();

        Map<String, Long> publicationsParType = publications.stream()
                .collect(Collectors.groupingBy(p -> p.getTypePub().name(), Collectors.counting()));

        Map<String, Long> membresParStatut = membres.stream()
                .collect(Collectors.groupingBy(m -> m.getStatut().name(), Collectors.counting()));

        RapportAnnuel rapport = RapportAnnuel.builder()
                .annee(annee)
                .dateGeneration(LocalDateTime.now())
                .generePar(membreRepository.findById(directeurId).orElse(null))
                .nbPublications((int) nbPublications)
                .nbEvenements((int) nbEvenements)
                .nbMembres((int) nbMembres)
                .nbDoctorants((int) nbDoctorants)
                .statut(StatutRapport.BROUILLON)
                .build();

        rapport = rapportRepository.save(rapport);

        return RapportAnnuelDTO.builder()
                .id(rapport.getId())
                .annee(annee)
                .dateGeneration(rapport.getDateGeneration())
                .generePar(rapport.getGenerePar() != null ?
                        rapport.getGenerePar().getNom() + " " + rapport.getGenerePar().getPrenom() : "")
                .statut(rapport.getStatut().name())
                .nbPublications((int) nbPublications)
                .nbEvenements((int) nbEvenements)
                .nbMembres((int) nbMembres)
                .nbDoctorants((int) nbDoctorants)
                .publicationsParType(publicationsParType)
                .membresParStatut(membresParStatut)
                .build();
    }

    @Override
    public List<RapportAnnuel> getRapports() {
        return rapportRepository.findAll();
    }

    @Override
    public RapportAnnuelDTO getRapportById(Long id) {
        RapportAnnuel rapport = rapportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RapportAnnuel", "id", id));
        return RapportAnnuelDTO.builder()
                .id(rapport.getId())
                .annee(rapport.getAnnee())
                .dateGeneration(rapport.getDateGeneration())
                .generePar(rapport.getGenerePar() != null ?
                        rapport.getGenerePar().getNom() + " " + rapport.getGenerePar().getPrenom() : "")
                .statut(rapport.getStatut().name())
                .nbPublications(rapport.getNbPublications())
                .nbEvenements(rapport.getNbEvenements())
                .nbMembres(rapport.getNbMembres())
                .nbDoctorants(rapport.getNbDoctorants())
                .build();
    }

    @Override
    public byte[] exportRapportPDF(Long rapportId) {
        throw new UnsupportedOperationException("Export PDF pas encore implémenté");
    }
}
