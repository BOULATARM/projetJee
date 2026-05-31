package com.lias.service.impl;

import com.lias.dto.request.MembreRequestDTO;
import com.lias.dto.response.MembreDetailDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.entity.AffiliationMembre;
import com.lias.entity.Membre;
import com.lias.entity.Publication;
import com.lias.entity.AuteurPublication;
import com.lias.enums.StatutMembre;
import com.lias.exception.ResourceNotFoundException;
import com.lias.mapper.MembreMapper;
import com.lias.repository.AffiliationMembreRepository;
import com.lias.repository.MembreRepository;
import com.lias.repository.PublicationRepository;
import com.lias.service.MembreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembreServiceImpl implements MembreService {

    private final MembreRepository membreRepository;
    private final AffiliationMembreRepository affiliationRepository;
    private final PublicationRepository publicationRepository;
    private final MembreMapper membreMapper;

    @Override
    public List<MembreResponseDTO> getAllMembres() {
        return membreMapper.toResponseDTOList(membreRepository.findByActiveTrue());
    }

    @Override
    public MembreDetailDTO getMembreById(Long id) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));

        List<AffiliationMembre> affiliations = affiliationRepository.findByMembreIdOrderByDateDebutDesc(id);

        List<Publication> publications = publicationRepository.findByAuteurs_MembreId(id);

        return MembreDetailDTO.builder()
                .id(membre.getId())
                .nom(membre.getNom())
                .prenom(membre.getPrenom())
                .email(membre.getEmail())
                .photo(membre.getPhoto())
                .biographie(membre.getBiographie())
                .centresInteret(membre.getCentresInteret())
                .dateNaissance(membre.getDateNaissance())
                .dateEmbauche(membre.getDateEmbauche())
                .etablissementOrigine(membre.getEtablissementOrigine())
                .laboratoireOrigine(membre.getLaboratoireOrigine())
                .statut(membre.getStatut())
                .active(membre.getActive())
                .systemRole(membre.getSystemRole())
                .affiliations(affiliations.stream().map(a ->
                        com.lias.dto.response.AffiliationDTO.builder()
                                .id(a.getId())
                                .equipeNom(a.getEquipe().getNom())
                                .equipeId(a.getEquipe().getId())
                                .dateDebut(a.getDateDebut())
                                .dateFin(a.getDateFin())
                                .actif(a.getActif())
                                .build()
                ).collect(Collectors.toList()))
                .roles(membre.getRoles().stream().map(r ->
                        com.lias.dto.response.RoleDTO.builder()
                                .id(r.getId())
                                .role(r.getRole())
                                .dateDebut(r.getDateDebut())
                                .dateFin(r.getDateFin())
                                .actif(r.getActif())
                                .build()
                ).collect(Collectors.toList()))
                .publications(publications.stream().map(p ->
                        com.lias.dto.response.PublicationSimpleDTO.builder()
                                .id(p.getId())
                                .titre(p.getTitre())
                                .annee(p.getAnnee())
                                .type(p.getTypePub().name())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional
    public MembreResponseDTO updateProfil(Long id, MembreRequestDTO dto) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));
        if (dto.getNom() != null) membre.setNom(dto.getNom());
        if (dto.getPrenom() != null) membre.setPrenom(dto.getPrenom());
        if (dto.getEmail() != null) membre.setEmail(dto.getEmail());
        if (dto.getPhoto() != null) membre.setPhoto(dto.getPhoto());
        if (dto.getBiographie() != null) membre.setBiographie(dto.getBiographie());
        if (dto.getCentresInteret() != null) membre.setCentresInteret(dto.getCentresInteret());
        if (dto.getDateNaissance() != null) membre.setDateNaissance(dto.getDateNaissance());
        if (dto.getDateEmbauche() != null) membre.setDateEmbauche(dto.getDateEmbauche());
        if (dto.getEtablissementOrigine() != null) membre.setEtablissementOrigine(dto.getEtablissementOrigine());
        if (dto.getLaboratoireOrigine() != null) membre.setLaboratoireOrigine(dto.getLaboratoireOrigine());
        if (dto.getStatut() != null) membre.setStatut(dto.getStatut());
        return membreMapper.toResponseDTO(membreRepository.save(membre));
    }

    @Override
    @Transactional
    public void changeStatut(Long id, StatutMembre statut) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));
        membre.setStatut(statut);
        membreRepository.save(membre);
    }

    @Override
    @Transactional
    public void desactiverCompte(Long id) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));
        membre.setActive(false);
        membreRepository.save(membre);
    }

    @Override
    @Transactional
    public void reactiverCompte(Long id) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));
        membre.setActive(true);
        membreRepository.save(membre);
    }

    @Override
    public List<MembreResponseDTO> getMembresParEquipe(Long equipeId) {
        List<AffiliationMembre> affiliations = affiliationRepository.findByEquipeIdAndActifTrue(equipeId);
        return affiliations.stream()
                .map(a -> membreMapper.toResponseDTO(a.getMembre()))
                .collect(Collectors.toList());
    }

    @Override
    public List<MembreResponseDTO> searchMembres(String keyword) {
        return membreMapper.toResponseDTOList(
                membreRepository.findByNomContainingOrPrenomContaining(keyword, keyword));
    }
}
