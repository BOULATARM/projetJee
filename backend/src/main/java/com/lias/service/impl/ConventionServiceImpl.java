package com.lias.service.impl;

import com.lias.dto.request.ConventionRequestDTO;
import com.lias.entity.ActiviteConvention;
import com.lias.entity.Convention;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.ConventionRepository;
import com.lias.repository.LaboratoireRepository;
import com.lias.service.ConventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConventionServiceImpl implements ConventionService {

    private final ConventionRepository conventionRepository;
    private final LaboratoireRepository laboratoireRepository;

    @Override
    @Transactional
    public Convention creerConvention(ConventionRequestDTO dto) {
        Convention convention = Convention.builder()
                .titre(dto.getTitre())
                .partenaire(dto.getPartenaire())
                .typePartenaire(dto.getTypePartenaire())
                .paysPartenaire(dto.getPaysPartenaire())
                .dateSignature(dto.getDateSignature())
                .dateExpiration(dto.getDateExpiration())
                .description(dto.getDescription())
                .laboratoire(laboratoireRepository.findAll().get(0))
                .build();
        return conventionRepository.save(convention);
    }

    @Override
    public List<Convention> getAllConventions() {
        return conventionRepository.findAll();
    }

    @Override
    public Convention getConventionById(Long id) {
        return conventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convention", "id", id));
    }

    @Override
    @Transactional
    public void ajouterActivite(Long conventionId, ActiviteConvention activite) {
        Convention convention = conventionRepository.findById(conventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Convention", "id", conventionId));
        activite.setConvention(convention);
        convention.getActivites().add(activite);
        conventionRepository.save(convention);
    }
}
