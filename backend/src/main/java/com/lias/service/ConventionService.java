package com.lias.service;

import com.lias.dto.request.ConventionRequestDTO;
import com.lias.entity.ActiviteConvention;
import com.lias.entity.Convention;
import java.util.List;

public interface ConventionService {
    Convention creerConvention(ConventionRequestDTO dto);
    List<Convention> getAllConventions();
    Convention getConventionById(Long id);
    void ajouterActivite(Long conventionId, ActiviteConvention activite);
}
