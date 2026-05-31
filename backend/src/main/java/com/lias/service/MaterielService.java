package com.lias.service;

import com.lias.dto.request.DistributionRequestDTO;
import com.lias.dto.request.MaterielRequestDTO;
import com.lias.entity.DistributionMateriel;
import com.lias.entity.Materiel;
import com.lias.entity.Membre;
import java.util.List;

public interface MaterielService {
    Materiel ajouterMateriel(MaterielRequestDTO dto);
    void distribuerMateriel(DistributionRequestDTO dto, Long distributeurId);
    List<Materiel> getMaterielStock();
    List<DistributionMateriel> getHistoriqueDistribution();
    List<Membre> getMembresAyantRecu(Long materielId);
    List<Membre> getMembresNAyantPasRecu(Long materielId);
}
