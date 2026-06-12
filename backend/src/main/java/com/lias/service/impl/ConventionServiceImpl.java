package com.lias.service.impl;

import com.lias.dto.request.ConventionRequestDTO;
import com.lias.entity.ActiviteConvention;
import com.lias.entity.Convention;
import com.lias.enums.StatutConvention;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.ConventionRepository;
import com.lias.repository.LaboratoireRepository;
import com.lias.service.ConventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConventionServiceImpl implements ConventionService {

    private final ConventionRepository conventionRepository;
    private final LaboratoireRepository laboratoireRepository;

    private StatutConvention calculerStatut(LocalDate dateExpiration) {
        if (dateExpiration == null) return StatutConvention.EN_COURS_NEGOCIATION;
        if (dateExpiration.isBefore(LocalDate.now())) return StatutConvention.EXPIREE;
        return StatutConvention.ACTIVE;
    }

    @Override
    @Transactional
    public Convention creerConvention(ConventionRequestDTO dto) {
        var labs = laboratoireRepository.findAll();
        Convention convention = Convention.builder()
                .titre(dto.getTitre())
                .partenaire(dto.getPartenaire())
                .typePartenaire(dto.getTypePartenaire())
                .paysPartenaire(dto.getPaysPartenaire())
                .dateSignature(dto.getDateSignature())
                .dateExpiration(dto.getDateExpiration())
                .description(dto.getDescription())
                .statut(calculerStatut(dto.getDateExpiration()))
                .laboratoire(labs.isEmpty() ? null : labs.get(0))
                .build();
        return conventionRepository.save(convention);
    }

    @Override
    @Transactional
    public Convention updateConvention(Long id, ConventionRequestDTO dto) {
        Convention convention = conventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convention", "id", id));
        convention.setTitre(dto.getTitre());
        convention.setPartenaire(dto.getPartenaire());
        convention.setTypePartenaire(dto.getTypePartenaire());
        convention.setPaysPartenaire(dto.getPaysPartenaire());
        convention.setDateSignature(dto.getDateSignature());
        convention.setDateExpiration(dto.getDateExpiration());
        convention.setDescription(dto.getDescription());
        convention.setStatut(calculerStatut(dto.getDateExpiration()));
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
