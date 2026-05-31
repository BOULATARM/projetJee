package com.lias.service.impl;

import com.lias.entity.DemandeMateriel;
import com.lias.entity.Membre;
import com.lias.enums.StatutDemande;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DemandeMaterielRepository;
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

    @Override
    @Transactional
    public DemandeMateriel creerDemande(DemandeMateriel demande, Long membreId) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));
        demande.setMembre(membre);
        demande.setStatut(StatutDemande.PENDING);
        demande.setDateDemande(LocalDateTime.now());
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
