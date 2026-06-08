package com.lias.service.impl;

import com.lias.dto.response.MembreResponseDTO;
import com.lias.entity.AffiliationMembre;
import com.lias.entity.Equipe;
import com.lias.entity.Membre;
import com.lias.exception.ResourceNotFoundException;
import com.lias.mapper.MembreMapper;
import com.lias.repository.AffiliationMembreRepository;
import com.lias.repository.EquipeRepository;
import com.lias.repository.MembreRepository;
import com.lias.service.EquipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipeServiceImpl implements EquipeService {

    private final EquipeRepository equipeRepository;
    private final MembreRepository membreRepository;
    private final AffiliationMembreRepository affiliationRepository;
    private final MembreMapper membreMapper;

    @Override
    public List<Equipe> getAllEquipes() {
        return equipeRepository.findAll();
    }

    @Override
    public Equipe getEquipeById(Long id) {
        return equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", "id", id));
    }

    @Override
    @Transactional
    public Equipe creerEquipe(String nom, String description, Long chefEquipeId) {
        Membre chef = null;
        if (chefEquipeId != null) {
            chef = membreRepository.findById(chefEquipeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", chefEquipeId));
        }
        Equipe equipe = Equipe.builder()
                .nom(nom)
                .description(description)
                .chefEquipe(chef)
                .dateCreation(java.time.LocalDate.now())
                .build();
        return equipeRepository.save(equipe);
    }

    @Override
    @Transactional
    public Equipe creerEquipeComplet(com.lias.dto.request.EquipeRequestDTO dto) {
        Membre chef = null;
        if (dto.getChefEquipeId() != null) {
            chef = membreRepository.findById(dto.getChefEquipeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", dto.getChefEquipeId()));
        }
        Equipe equipe = Equipe.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .axeRecherche(dto.getAxeRecherche())
                .dateCreation(dto.getDateCreation() != null ? dto.getDateCreation() : java.time.LocalDate.now())
                .chefEquipe(chef)
                .build();
        return equipeRepository.save(equipe);
    }

    @Override
    @Transactional
    public Equipe updateEquipe(Long id, String nom, String description) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", "id", id));
        if (nom != null) equipe.setNom(nom);
        if (description != null) equipe.setDescription(description);
        return equipeRepository.save(equipe);
    }

    @Override
    @Transactional
    public void affecterMembre(Long membreId, Long equipeId, LocalDate dateDebut) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", "id", equipeId));

        affiliationRepository.findByMembreIdAndActifTrue(membreId).ifPresent(a -> {
            a.setActif(false);
            a.setDateFin(dateDebut.minusDays(1));
            affiliationRepository.save(a);
        });

        AffiliationMembre affiliation = AffiliationMembre.builder()
                .membre(membre)
                .equipe(equipe)
                .dateDebut(dateDebut)
                .actif(true)
                .build();
        affiliationRepository.save(affiliation);
    }

    @Override
    @Transactional
    public void retirerMembre(Long membreId, Long equipeId, LocalDate dateFin) {
        affiliationRepository.findByMembreIdAndActifTrue(membreId).ifPresent(a -> {
            a.setActif(false);
            a.setDateFin(dateFin);
            affiliationRepository.save(a);
        });
    }

    @Transactional
    public void retirerMembreAvecMotif(Long membreId, Long equipeId, LocalDate dateFin, String motifDepart) {
        affiliationRepository.findByMembreIdAndActifTrue(membreId).ifPresent(a -> {
            a.setActif(false);
            a.setDateFin(dateFin);
            a.setMotifDepart(motifDepart);
            affiliationRepository.save(a);
        });
    }

    @Override
    public List<AffiliationMembre> getHistoriqueAffiliations(Long membreId) {
        return affiliationRepository.findByMembreIdOrderByDateDebutDesc(membreId);
    }

    @Override
    public List<AffiliationMembre> getAffiliationsByEquipe(Long equipeId) {
        return affiliationRepository.findByEquipeIdAndActifTrue(equipeId);
    }

    @Override
    public List<MembreResponseDTO> getMembresActifs(Long equipeId) {
        List<AffiliationMembre> affiliations = affiliationRepository.findByEquipeIdAndActifTrue(equipeId);
        return affiliations.stream()
                .map(a -> membreMapper.toResponseDTO(a.getMembre()))
                .collect(java.util.stream.Collectors.toList());
    }
}
