package com.lias.service;

import com.lias.entity.Mandat;
import java.time.LocalDate;
import java.util.List;

public interface MandatService {
    Mandat getMandatActif();
    Mandat creerMandat(Long directeurId, Long viceDirecteurId, LocalDate dateDebut);
    void cloturerMandat(Long mandatId, LocalDate dateFin);
    List<Mandat> getHistoriqueMandats();
    Mandat setChefsEquipe(Long mandatId, java.util.List<Long> membreIds);
}
