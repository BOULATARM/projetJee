package com.lias.service.impl;

import com.lias.dto.request.DemandeMaterielRequestDTO;
import com.lias.entity.DemandeMateriel;
import com.lias.entity.Materiel;
import com.lias.entity.Membre;
import com.lias.enums.StatutDemande;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DemandeMaterielRepository;
import com.lias.repository.MaterielRepository;
import com.lias.repository.MembreRepository;
import com.lias.service.DemandeMaterielService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeMaterielServiceImpl implements DemandeMaterielService {

    private final DemandeMaterielRepository demandeRepository;
    private final MembreRepository membreRepository;
    private final MaterielRepository materielRepository;

    @Override
    @Transactional
    public DemandeMateriel creerDemande(DemandeMaterielRequestDTO dto, Long membreId) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));

        Materiel materiel = null;
        if (dto.getMaterielId() != null) {
            materiel = materielRepository.findById(dto.getMaterielId())
                    .orElseThrow(() -> new ResourceNotFoundException("Materiel", "id", dto.getMaterielId()));
        }

        int quantite = dto.getQuantite() != null ? dto.getQuantite() : 1;
        if (materiel != null && quantite > materiel.getQuantiteDisponible()) {
            throw new RuntimeException(
                "Quantité demandée (" + quantite + ") dépasse le stock disponible (" + materiel.getQuantiteDisponible() + ")."
            );
        }

        DemandeMateriel demande = DemandeMateriel.builder()
                .membre(membre)
                .materielDemande(materiel)
                .description(dto.getDescription())
                .justification(dto.getJustification())
                .quantite(quantite)
                .datePriseSouhaitee(dto.getDatePriseSouhaitee())
                .dateRetourPrevue(dto.getDateRetourPrevue())
                .statut(StatutDemande.PENDING)
                .dateDemande(LocalDateTime.now())
                .build();
        return demandeRepository.save(demande);
    }

    @Override
    public List<DemandeMateriel> getAllDemandes() {
        return demandeRepository.findAll();
    }

    @Override
    public List<DemandeMateriel> getDemandesByMembre(Long membreId) {
        return demandeRepository.findByMembreId(membreId);
    }

    @Override
    @Transactional
    public void validerDemande(Long demandeId, Long traiteParId) {
        DemandeMateriel demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeMateriel", "id", demandeId));
        Membre traitePar = membreRepository.findById(traiteParId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", traiteParId));

        // Check quantity availability during the requested period
        if (demande.getMaterielDemande() != null
                && demande.getDatePriseSouhaitee() != null
                && demande.getDateRetourPrevue() != null) {

            Materiel mat = materielRepository.findById(demande.getMaterielDemande().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Materiel", "id", demande.getMaterielDemande().getId()));

            java.util.List<DemandeMateriel> overlapping = demandeRepository.findConflicts(
                    mat.getId(),
                    demande.getDatePriseSouhaitee(),
                    demande.getDateRetourPrevue(),
                    demandeId
            );

            int alreadyReserved = overlapping.stream()
                    .mapToInt(d -> d.getQuantite() != null ? d.getQuantite() : 1)
                    .sum();
            int requested = demande.getQuantite() != null ? demande.getQuantite() : 1;
            int available = mat.getQuantiteTotale() - alreadyReserved;

            if (requested > available) {
                String detail = overlapping.isEmpty() ? "" :
                    " — déjà réservé(es) : " + overlapping.stream()
                        .map(d -> d.getQuantite() + " par " + d.getMembre().getPrenom() + " " + d.getMembre().getNom()
                             + " (" + d.getDatePriseSouhaitee() + " → " + d.getDateRetourPrevue() + ")")
                        .reduce((a, b) -> a + ", " + b).orElse("");
                throw new RuntimeException(
                    "Stock insuffisant sur cette période : " + available + " unité(s) disponible(s) sur "
                    + mat.getQuantiteTotale() + detail
                );
            }
        }

        demande.setStatut(StatutDemande.ACCEPTEE);
        demande.setDateTraitement(LocalDateTime.now());
        demande.setTraitePar(traitePar);
        demandeRepository.save(demande);
    }

    @Override
    @Transactional
    public void refuserDemande(Long demandeId, Long traiteParId) {
        DemandeMateriel demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeMateriel", "id", demandeId));
        Membre traitePar = membreRepository.findById(traiteParId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", traiteParId));
        demande.setStatut(StatutDemande.REFUSEE);
        demande.setDateTraitement(LocalDateTime.now());
        demande.setTraitePar(traitePar);
        demandeRepository.save(demande);
    }
}
