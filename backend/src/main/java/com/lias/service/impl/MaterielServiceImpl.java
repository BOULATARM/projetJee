package com.lias.service.impl;

import com.lias.dto.request.DistributionRequestDTO;
import com.lias.dto.request.MaterielRequestDTO;
import com.lias.entity.DistributionMateriel;
import com.lias.entity.Materiel;
import com.lias.entity.Membre;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DistributionMaterielRepository;
import com.lias.repository.MaterielRepository;
import com.lias.repository.MembreRepository;
import com.lias.service.MaterielService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterielServiceImpl implements MaterielService {

    private final MaterielRepository materielRepository;
    private final DistributionMaterielRepository distributionRepository;
    private final MembreRepository membreRepository;

    @Override
    @Transactional
    public Materiel ajouterMateriel(MaterielRequestDTO dto) {
        Materiel materiel = Materiel.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .quantiteTotale(dto.getQuantiteTotale())
                .quantiteDisponible(dto.getQuantiteTotale())
                .dateArrivage(dto.getDateArrivage())
                .categorie(dto.getCategorie())
                .build();
        return materielRepository.save(materiel);
    }

    @Override
    @Transactional
    public void distribuerMateriel(DistributionRequestDTO dto, Long distributeurId) {
        Materiel materiel = materielRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new ResourceNotFoundException("Materiel", "id", dto.getMaterielId()));
        Membre membre = membreRepository.findById(dto.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", dto.getMembreId()));
        Membre distributeur = membreRepository.findById(distributeurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", distributeurId));

        if (materiel.getQuantiteDisponible() < dto.getQuantite()) {
            throw new RuntimeException("Stock insuffisant. Disponible: " + materiel.getQuantiteDisponible());
        }

        DistributionMateriel distribution = DistributionMateriel.builder()
                .materiel(materiel)
                .membre(membre)
                .quantite(dto.getQuantite())
                .dateDistribution(LocalDate.now())
                .distributePar(distributeur)
                .commentaire(dto.getCommentaire())
                .build();

        materiel.setQuantiteDisponible(materiel.getQuantiteDisponible() - dto.getQuantite());
        materielRepository.save(materiel);
        distributionRepository.save(distribution);
    }

    @Override
    public List<Materiel> getMaterielStock() {
        return materielRepository.findAll();
    }

    @Override
    public List<DistributionMateriel> getHistoriqueDistribution() {
        return distributionRepository.findAll();
    }

    @Override
    public List<Membre> getMembresAyantRecu(Long materielId) {
        return distributionRepository.findMembresAyantRecu(materielId);
    }

    @Override
    public List<Membre> getMembresNAyantPasRecu(Long materielId) {
        List<Membre> ayantRecu = getMembresAyantRecu(materielId);
        List<Membre> tousMembres = membreRepository.findByActiveTrue();
        tousMembres.removeAll(ayantRecu);
        return tousMembres;
    }
}
