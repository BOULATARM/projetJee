package com.lias.service;

import com.lias.entity.Mandat;
import java.time.LocalDate;
import java.util.List;

public interface MandatService {
    Mandat getMandatActif();
    Mandat creerMandat(Long directeurId, Long viceDirecteurId, LocalDate dateDebut, String adminEmail);
    void cloturerMandat(Long mandatId, LocalDate dateFin, String adminEmail);
    List<Mandat> getHistoriqueMandats();
}
