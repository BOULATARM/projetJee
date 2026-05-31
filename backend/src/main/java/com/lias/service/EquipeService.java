package com.lias.service;

import com.lias.entity.AffiliationMembre;
import com.lias.entity.Equipe;
import java.time.LocalDate;
import java.util.List;

public interface EquipeService {
    List<Equipe> getAllEquipes();
    Equipe getEquipeById(Long id);
    Equipe creerEquipe(String nom, String description, Long chefEquipeId);
    Equipe updateEquipe(Long id, String nom, String description);
    void affecterMembre(Long membreId, Long equipeId, LocalDate dateDebut);
    void retirerMembre(Long membreId, Long equipeId, LocalDate dateFin);
    List<AffiliationMembre> getHistoriqueAffiliations(Long membreId);
    List<AffiliationMembre> getAffiliationsByEquipe(Long equipeId);
}
