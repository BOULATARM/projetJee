package com.lias.service.impl;

import com.lias.dto.request.DistributionRequestDTO;
import com.lias.dto.request.MaterielRequestDTO;
import com.lias.entity.DistributionMateriel;
import com.lias.entity.Materiel;
import com.lias.entity.MaterielHistorique;
import com.lias.entity.Membre;
import com.lias.enums.TypeMateriel;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DistributionMaterielRepository;
import com.lias.repository.MaterielHistoriqueRepository;
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
    private final MaterielHistoriqueRepository historiqueRepository;

    @Override
    @Transactional
    public Materiel ajouterMateriel(MaterielRequestDTO dto, Long adminId) {
        TypeMateriel type = dto.getTypeMateriel() != null ? dto.getTypeMateriel() : TypeMateriel.DEFINITIF;
        Materiel materiel = Materiel.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .quantiteTotale(dto.getQuantiteTotale())
                .quantiteDisponible(dto.getQuantiteTotale())
                .dateArrivage(dto.getDateArrivage())
                .categorie(dto.getCategorie())
                .typeMateriel(type)
                .build();
        Materiel saved = materielRepository.save(materiel);

        Membre admin = membreRepository.findById(adminId).orElse(null);
        MaterielHistorique hist = MaterielHistorique.builder()
                .materiel(saved)
                .action("CREATION")
                .details("Arrivage de " + dto.getQuantiteTotale() + " unité(s), type: " + type.name())
                .faitPar(admin)
                .build();
        historiqueRepository.save(hist);
        return saved;
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

        TypeMateriel type = dto.getTypeMateriel() != null ? dto.getTypeMateriel() : materiel.getTypeMateriel();

        DistributionMateriel distribution = DistributionMateriel.builder()
                .materiel(materiel)
                .membre(membre)
                .quantite(dto.getQuantite())
                .dateDistribution(LocalDate.now())
                .typeMateriel(type)
                .datePrise(dto.getDatePrise() != null ? dto.getDatePrise() : LocalDate.now())
                .dateRetourPrevue(dto.getDateRetourPrevue())
                .distributePar(distributeur)
                .commentaire(dto.getCommentaire())
                .build();

        materiel.setQuantiteDisponible(materiel.getQuantiteDisponible() - dto.getQuantite());
        materielRepository.save(materiel);
        distributionRepository.save(distribution);

        MaterielHistorique hist = MaterielHistorique.builder()
                .materiel(materiel)
                .action("DISTRIBUTION")
                .details("Distribué à " + membre.getPrenom() + " " + membre.getNom()
                        + " (" + dto.getQuantite() + " unité(s)), type: " + type.name()
                        + (dto.getDateRetourPrevue() != null ? ", retour prévu: " + dto.getDateRetourPrevue() : ""))
                .faitPar(distributeur)
                .build();
        historiqueRepository.save(hist);
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
    public List<MaterielHistorique> getHistoriqueMateriel(Long materielId) {
        return historiqueRepository.findByMaterielIdOrderByDateActionDesc(materielId);
    }

    @Override
    public List<Membre> getMembresAyantRecu(Long materielId) {
        return distributionRepository.findMembresAyantRecu(materielId);
    }

    @Override
    public List<Membre> getMembresNAyantPasRecu(Long materielId) {
        List<Membre> ayantRecu = getMembresAyantRecu(materielId);
        List<Membre> tousMembres = new java.util.ArrayList<>(membreRepository.findByActiveTrue());
        tousMembres.removeAll(ayantRecu);
        return tousMembres;
    }

    @Override
    @Transactional
    public Materiel updateMateriel(Long id, MaterielRequestDTO dto, Long adminId) {
        Materiel materiel = materielRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Materiel", "id", id));

        StringBuilder changes = new StringBuilder();
        if (!materiel.getNom().equals(dto.getNom())) changes.append("Nom: ").append(materiel.getNom()).append(" → ").append(dto.getNom()).append("; ");
        if (dto.getCategorie() != null && !dto.getCategorie().equals(materiel.getCategorie())) changes.append("Catégorie: ").append(materiel.getCategorie()).append(" → ").append(dto.getCategorie()).append("; ");
        if (dto.getQuantiteTotale() != null && !dto.getQuantiteTotale().equals(materiel.getQuantiteTotale())) changes.append("Qté: ").append(materiel.getQuantiteTotale()).append(" → ").append(dto.getQuantiteTotale()).append("; ");
        if (dto.getTypeMateriel() != null && dto.getTypeMateriel() != materiel.getTypeMateriel()) changes.append("Type: ").append(materiel.getTypeMateriel()).append(" → ").append(dto.getTypeMateriel()).append("; ");

        materiel.setNom(dto.getNom());
        materiel.setDescription(dto.getDescription());
        materiel.setCategorie(dto.getCategorie());
        if (dto.getTypeMateriel() != null) materiel.setTypeMateriel(dto.getTypeMateriel());
        if (dto.getQuantiteTotale() != null) {
            int diff = dto.getQuantiteTotale() - materiel.getQuantiteTotale();
            materiel.setQuantiteTotale(dto.getQuantiteTotale());
            materiel.setQuantiteDisponible(materiel.getQuantiteDisponible() + diff);
        }
        Materiel saved = materielRepository.save(materiel);

        if (changes.length() > 0) {
            Membre admin = membreRepository.findById(adminId).orElse(null);
            MaterielHistorique hist = MaterielHistorique.builder()
                    .materiel(saved)
                    .action("MODIFICATION")
                    .details(changes.toString().trim())
                    .faitPar(admin)
                    .build();
            historiqueRepository.save(hist);
        }
        return saved;
    }

    @Override
    public List<Membre> getMembresSansDistribution() {
        List<Long> ayantRecuIds = distributionRepository.findAll()
                .stream().map(d -> d.getMembre().getId()).distinct().toList();
        return membreRepository.findByActiveTrue()
                .stream().filter(m -> !ayantRecuIds.contains(m.getId())).toList();
    }
}
