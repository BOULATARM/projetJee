package com.lias.service;

import com.lias.dto.request.LaboratoireRequestDTO;
import com.lias.entity.Laboratoire;

public interface LaboratoireService {
    Laboratoire getLaboratoire();
    Laboratoire modifierLaboratoire(LaboratoireRequestDTO dto);
}
