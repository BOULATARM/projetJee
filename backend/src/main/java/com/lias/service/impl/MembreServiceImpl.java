package com.lias.service.impl;

import com.lias.dto.request.MembreRequestDTO;
import com.lias.dto.response.MembreDetailDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.entity.AffiliationMembre;
import com.lias.entity.Membre;
import com.lias.entity.Publication;
import com.lias.entity.AuteurPublication;
import com.lias.enums.StatutMembre;
import com.lias.enums.TypeNotification;
import com.lias.exception.ResourceNotFoundException;
import com.lias.mapper.MembreMapper;
import com.lias.entity.Equipe;
import com.lias.repository.AffiliationMembreRepository;
import com.lias.repository.EquipeRepository;
import com.lias.repository.MembreRepository;
import com.lias.repository.PublicationRepository;
import com.lias.service.AuditLogService;
import com.lias.service.MembreService;
import com.lias.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembreServiceImpl implements MembreService {

    private final MembreRepository membreRepository;
    private final AffiliationMembreRepository affiliationRepository;
    private final PublicationRepository publicationRepository;
    private final EquipeRepository equipeRepository;
    private final MembreMapper membreMapper;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Override
    public List<MembreResponseDTO> getAllMembres() {
        return membreRepository.findByActiveTrue().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private MembreResponseDTO toResponseDTO(Membre m) {
        // Équipe active
        String equipeNom = affiliationRepository.findByMembreIdAndActifTrue(m.getId())
                .map(a -> a.getEquipe() != null ? a.getEquipe().getNom() : null)
                .orElse(null);
        Long equipeId = affiliationRepository.findByMembreIdAndActifTrue(m.getId())
                .map(a -> a.getEquipe() != null ? a.getEquipe().getId() : null)
                .orElse(null);

        return MembreResponseDTO.builder()
                .id(m.getId())
                .nom(m.getNom())
                .prenom(m.getPrenom())
                .email(m.getEmail())
                .photo(m.getPhoto())
                .biographie(m.getBiographie())
                .centresInteret(m.getCentresInteret())
                .dateEmbauche(m.getDateEmbauche())
                .etablissementOrigine(m.getEtablissementOrigine())
                .laboratoireOrigine(m.getLaboratoireOrigine())
                .statut(m.getStatut())
                .active(m.getActive())
                .roleActuel(m.getSystemRole())
                .equipeActuelle(equipeNom)
                .equipeId(equipeId)
                .build();
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
                                .motifDepart(a.getMotifDepart())
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
                                .lienUrl(p.getLienUrl())
                                .doi(p.getDoi())
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
        String ancienStatut = membre.getStatut() != null ? membre.getStatut().name() : "INCONNU";
        membre.setStatut(statut);
        auditLogService.log("MEMBRE", "CHANGEMENT_STATUT", "changeStatut",
                membre.getEmail(), id, ancienStatut + " → " + statut.name());

        // Workflow départ: close all active affiliations when a member retires or leaves
        if (statut == StatutMembre.RETRAITE || statut == StatutMembre.ANCIEN) {
            List<AffiliationMembre> actives = affiliationRepository.findByMembreIdOrderByDateDebutDesc(id)
                    .stream().filter(a -> Boolean.TRUE.equals(a.getActif())).collect(Collectors.toList());
            for (AffiliationMembre a : actives) {
                a.setActif(false);
                a.setDateFin(LocalDate.now());
            }
            affiliationRepository.saveAll(actives);

            try {
                notificationService.envoyerNotification(
                        id,
                        "Votre statut a été mis à jour : " + statut.name() + ". Vos affiliations aux équipes ont été clôturées.",
                        TypeNotification.DEPART_MEMBRE
                );
            } catch (Exception ignored) {}
        }

        membreRepository.save(membre);
    }

    @Override
    @Transactional
    public void desactiverCompte(Long id) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));
        membre.setActive(false);
        membreRepository.save(membre);
        auditLogService.log("MEMBRE", "COMPTE_BLOQUE", "desactiverCompte",
                membre.getEmail(), id, "Compte désactivé");
    }

    @Override
    @Transactional
    public void reactiverCompte(Long id) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));
        membre.setActive(true);
        membreRepository.save(membre);
        auditLogService.log("MEMBRE", "COMPTE_DEBLOQUE", "reactiverCompte",
                membre.getEmail(), id, "Compte réactivé");
    }

    @Override
    public List<MembreResponseDTO> getMembresParEquipe(Long equipeId) {
        List<AffiliationMembre> affiliations = affiliationRepository.findByEquipeIdAndActifTrue(equipeId);
        return affiliations.stream()
                .map(a -> membreMapper.toResponseDTO(a.getMembre()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void changerEquipe(Long membreId, Long equipeId) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", "id", equipeId));

        affiliationRepository.findByMembreIdAndActifTrue(membreId).ifPresent(a -> {
            a.setActif(false);
            a.setDateFin(LocalDate.now());
            affiliationRepository.save(a);
        });

        AffiliationMembre affiliation = AffiliationMembre.builder()
                .membre(membre)
                .equipe(equipe)
                .dateDebut(LocalDate.now())
                .actif(true)
                .build();
        affiliationRepository.save(affiliation);
    }

    @Override
    public List<MembreResponseDTO> searchMembres(String keyword) {
        return membreMapper.toResponseDTOList(
                membreRepository.findByNomContainingOrPrenomContaining(keyword, keyword));
    }
}
