package com.lias.service;

import com.lias.dto.response.RapportAnnuelDTO;
import java.util.List;

public interface RapportAnnuelService {
    RapportAnnuelDTO genererRapport(Integer annee, Long directeurId);
    List<RapportAnnuelDTO> getRapports();
    RapportAnnuelDTO getRapportById(Long id);
    byte[] exportRapportPDF(Long rapportId);
}
