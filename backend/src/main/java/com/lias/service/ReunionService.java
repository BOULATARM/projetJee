package com.lias.service;

import com.lias.dto.request.ReunionRequestDTO;
import com.lias.entity.Reunion;
import java.util.List;

public interface ReunionService {
    List<Reunion> getAllReunions();
    Reunion getReunionById(Long id);
    Reunion creerReunion(ReunionRequestDTO dto, Long creeParId);
    void marquerPresence(Long reunionId, Long membreId, Boolean present);
}
