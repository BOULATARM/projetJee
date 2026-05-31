package com.lias.service.impl;

import com.lias.dto.request.PublicationRequestDTO;
import com.lias.dto.response.AuteurDTO;
import com.lias.dto.response.PublicationResponseDTO;
import com.lias.entity.AuteurPublication;
import com.lias.entity.Equipe;
import com.lias.entity.Membre;
import com.lias.entity.Publication;
import com.lias.exception.ResourceNotFoundException;
import com.lias.mapper.PublicationMapper;
import com.lias.repository.EquipeRepository;
import com.lias.repository.MembreRepository;
import com.lias.repository.PublicationRepository;
import com.lias.service.PublicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicationServiceImpl implements PublicationService {

    private final PublicationRepository publicationRepository;
    private final MembreRepository membreRepository;
    private final EquipeRepository equipeRepository;
    private final PublicationMapper publicationMapper;

    @Override
    @Transactional
    public PublicationResponseDTO ajouterPublication(PublicationRequestDTO dto, Long membreId) {
        Equipe equipe = null;
        if (dto.getEquipeId() != null) {
            equipe = equipeRepository.findById(dto.getEquipeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipe", "id", dto.getEquipeId()));
        }

        Publication publication = Publication.builder()
                .titre(dto.getTitre())
                .resume(dto.getResume())
                .annee(dto.getAnnee())
                .doi(dto.getDoi())
                .lienUrl(dto.getLienUrl())
                .typePub(dto.getTypePublication())
                .equipe(equipe)
                .dateAjout(LocalDateTime.now())
                .auteurs(new ArrayList<>())
                .build();

        if (dto.getAuteurIds() != null) {
            for (int i = 0; i < dto.getAuteurIds().size(); i++) {
                Long auteurId = dto.getAuteurIds().get(i);
                Membre auteur = membreRepository.findById(auteurId)
                        .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", auteurId));
                AuteurPublication ap = AuteurPublication.builder()
                        .membre(auteur)
                        .publication(publication)
                        .ordreAuteur(dto.getOrdresAuteurs() != null ? dto.getOrdresAuteurs().get(i) : i + 1)
                        .auteurCorrespondant(i == 0)
                        .build();
                publication.getAuteurs().add(ap);
            }
        }

        publication = publicationRepository.save(publication);
        return toResponseDTO(publication);
    }

    @Override
    public List<PublicationResponseDTO> getAllPublications() {
        return publicationRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PublicationResponseDTO getPublicationById(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publication", "id", id));
        return toResponseDTO(publication);
    }

    @Override
    @Transactional
    public PublicationResponseDTO updatePublication(Long id, PublicationRequestDTO dto) {
        Publication pub = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publication", "id", id));
        if (dto.getTitre() != null) pub.setTitre(dto.getTitre());
        if (dto.getResume() != null) pub.setResume(dto.getResume());
        if (dto.getAnnee() != null) pub.setAnnee(dto.getAnnee());
        if (dto.getDoi() != null) pub.setDoi(dto.getDoi());
        if (dto.getLienUrl() != null) pub.setLienUrl(dto.getLienUrl());
        if (dto.getTypePublication() != null) pub.setTypePub(dto.getTypePublication());
        return toResponseDTO(publicationRepository.save(pub));
    }

    @Override
    @Transactional
    public void deletePublication(Long id) {
        publicationRepository.deleteById(id);
    }

    @Override
    public List<PublicationResponseDTO> getPublicationsByMembre(Long membreId) {
        return publicationRepository.findByAuteurs_MembreId(membreId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PublicationResponseDTO> getPublicationsByEquipe(Long equipeId) {
        return publicationRepository.findByEquipeId(equipeId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PublicationResponseDTO> getPublicationsByAnnee(Integer annee) {
        return publicationRepository.findByAnnee(annee).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private PublicationResponseDTO toResponseDTO(Publication publication) {
        return PublicationResponseDTO.builder()
                .id(publication.getId())
                .titre(publication.getTitre())
                .resume(publication.getResume())
                .annee(publication.getAnnee())
                .doi(publication.getDoi())
                .lienUrl(publication.getLienUrl())
                .typePub(publication.getTypePub())
                .dateAjout(publication.getDateAjout())
                .fichierPath(publication.getFichierPath())
                .equipe(publication.getEquipe() != null ? publication.getEquipe().getNom() : null)
                .equipeId(publication.getEquipe() != null ? publication.getEquipe().getId() : null)
                .auteurs(publication.getAuteurs().stream().map(a ->
                        AuteurDTO.builder()
                                .id(a.getMembre().getId())
                                .nom(a.getMembre().getNom())
                                .prenom(a.getMembre().getPrenom())
                                .ordreAuteur(a.getOrdreAuteur())
                                .auteurCorrespondant(a.getAuteurCorrespondant())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}
