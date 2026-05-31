package com.lias.service;

import com.lias.entity.DemandeMateriel;
import java.util.List;

public interface DemandeMaterielService {
    DemandeMateriel creerDemande(DemandeMateriel demande, Long membreId);
    List<DemandeMateriel> getAllDemandes();
    List<DemandeMateriel> getDemandesByMembre(Long membreId);
    void validerDemande(Long demandeId, Long traiteParId);
    void refuserDemande(Long demandeId, Long traiteParId);
}
