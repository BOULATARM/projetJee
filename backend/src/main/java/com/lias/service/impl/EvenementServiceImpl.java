package com.lias.service.impl;

import com.lias.dto.request.EvenementRequestDTO;
import com.lias.dto.response.EvenementResponseDTO;
import com.lias.dto.response.OrganisateurDTO;
import com.lias.entity.Evenement;
import com.lias.entity.Laboratoire;
import com.lias.entity.Membre;
import com.lias.entity.OrganisateurEvenement;
import com.lias.enums.StatutEvenement;
import com.lias.exception.ResourceNotFoundException;
import com.lias.mapper.EvenementMapper;
import com.lias.repository.EvenementRepository;
import com.lias.repository.LaboratoireRepository;
import com.lias.repository.MembreRepository;
import com.lias.service.EvenementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvenementServiceImpl implements EvenementService {

    private final EvenementRepository evenementRepository;
    private final LaboratoireRepository laboratoireRepository;
    private final MembreRepository membreRepository;
    private final EvenementMapper evenementMapper;

    @Override
    @Transactional
    public EvenementResponseDTO creerEvenement(EvenementRequestDTO dto) {
        List<Laboratoire> labos = laboratoireRepository.findAll();
        Laboratoire laboratoire = labos.isEmpty() ? null : labos.get(0);

        Evenement evenement = Evenement.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .type(dto.getType())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .lieu(dto.getLieu())
                .edition(dto.getEdition())
                .annee(dto.getAnnee() != null ? dto.getAnnee() :
                        dto.getDateDebut() != null ? dto.getDateDebut().getYear() : LocalDateTime.now().getYear())
                .laboratoire(laboratoire)
                .statut(StatutEvenement.PLANIFIE)
                .build();

        return toResponseDTO(evenementRepository.save(evenement));
    }

    @Override
    public List<EvenementResponseDTO> getAllEvenements() {
        return evenementRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EvenementResponseDTO getEvenementById(Long id) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", id));
        return toResponseDTO(evenement);
    }

    @Override
    @Transactional
    public EvenementResponseDTO updateEvenement(Long id, EvenementRequestDTO dto) {
        Evenement evt = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", id));
        if (dto.getTitre() != null) evt.setTitre(dto.getTitre());
        if (dto.getDescription() != null) evt.setDescription(dto.getDescription());
        if (dto.getType() != null) evt.setType(dto.getType());
        if (dto.getDateDebut() != null) evt.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) evt.setDateFin(dto.getDateFin());
        if (dto.getLieu() != null) evt.setLieu(dto.getLieu());
        if (dto.getEdition() != null) evt.setEdition(dto.getEdition());
        return toResponseDTO(evenementRepository.save(evt));
    }

    @Override
    public List<EvenementResponseDTO> getEvenementsByAnnee(Integer annee) {
        return evenementRepository.findByAnnee(annee).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void affecterOrganisateur(Long evenementId, Long membreId, String role) {
        Evenement evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", evenementId));
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));

        OrganisateurEvenement org = OrganisateurEvenement.builder()
                .evenement(evenement)
                .membre(membre)
                .roleOrganisation(role)
                .build();
        evenement.getOrganisateurs().add(org);
        evenementRepository.save(evenement);
    }

    @Override
    @Transactional
    public void changerStatut(Long evenementId, StatutEvenement statut) {
        Evenement evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", evenementId));
        evenement.setStatut(statut);
        evenementRepository.save(evenement);
    }

    @Override
    public List<EvenementResponseDTO> getEvenementsByDateRange(LocalDateTime debut, LocalDateTime fin) {
        return evenementRepository.findByDateDebutBetween(debut, fin).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private EvenementResponseDTO toResponseDTO(Evenement evenement) {
        return EvenementResponseDTO.builder()
                .id(evenement.getId())
                .titre(evenement.getTitre())
                .description(evenement.getDescription())
                .type(evenement.getType())
                .dateDebut(evenement.getDateDebut())
                .dateFin(evenement.getDateFin())
                .lieu(evenement.getLieu())
                .edition(evenement.getEdition())
                .annee(evenement.getAnnee())
                .statut(evenement.getStatut())
                .nbDocuments(evenement.getDocuments() != null ? evenement.getDocuments().size() : 0)
                .organisateurs(evenement.getOrganisateurs().stream().map(o ->
                        OrganisateurDTO.builder()
                                .id(o.getMembre().getId())
                                .nom(o.getMembre().getNom())
                                .prenom(o.getMembre().getPrenom())
                                .roleOrganisation(o.getRoleOrganisation())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}
