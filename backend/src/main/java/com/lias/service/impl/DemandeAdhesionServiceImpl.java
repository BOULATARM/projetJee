package com.lias.service.impl;

import com.lias.dto.request.DemandeAdhesionRequestDTO;
import com.lias.entity.DemandeAdhesion;
import com.lias.entity.Membre;
import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutDemande;
import com.lias.enums.StatutMembre;
import com.lias.exception.ResourceNotFoundException;
import com.lias.entity.AffiliationMembre;
import com.lias.entity.Equipe;
import com.lias.repository.AffiliationMembreRepository;
import com.lias.repository.DemandeAdhesionRepository;
import com.lias.repository.EquipeRepository;
import com.lias.repository.MembreRepository;
import com.lias.service.DemandeAdhesionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandeAdhesionServiceImpl implements DemandeAdhesionService {

    private final DemandeAdhesionRepository demandeRepository;
    private final MembreRepository membreRepository;
    private final AffiliationMembreRepository affiliationRepository;
    private final EquipeRepository equipeRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.lias.service.FileStorageService fileStorageService;

    @Override
    @Transactional
    public DemandeAdhesion soumettreDemandePublique(DemandeAdhesionRequestDTO dto) {
        if (membreRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Un compte avec cet email existe déjà");
        }

        DemandeAdhesion demande = DemandeAdhesion.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .motivation(dto.getMotivation())
                .cvPath(dto.getCvPath())
                .nomFaculte(dto.getNomFaculte())
                .nomLaboOrigine(dto.getNomLaboOrigine())
                .dateNaissance(dto.getDateNaissance())
                .dateEmbauche(dto.getDateEmbauche())
                .biographie(dto.getBiographie())
                .centresInteret(dto.getCentresInteret())
                .publications(dto.getPublications())
                .equipeId(dto.getEquipeId())
                .statut(StatutDemande.PENDING)
                .dateDepot(LocalDateTime.now())
                .typeMembreDemande(dto.getTypeMembreDemande() != null ?
                        dto.getTypeMembreDemande() : StatutMembre.ASSOCIE)
                .build();

        return demandeRepository.save(demande);
    }

    @Override
    public List<DemandeAdhesion> getPendingDemandes() {
        return demandeRepository.findByStatut(StatutDemande.PENDING);
    }

    @Override
    public List<DemandeAdhesion> getAllDemandes() {
        return demandeRepository.findAll();
    }

    @Override
    public DemandeAdhesion getDemandeById(Long id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAdhesion", "id", id));
    }

    @Override
    @Transactional
    public void accepterDemande(Long demandeId, Long directeurId) {
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAdhesion", "id", demandeId));

        Membre directeur = membreRepository.findById(directeurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", directeurId));

        if (membreRepository.existsByEmail(demande.getEmail())) {
            throw new RuntimeException("Un compte avec l'email " + demande.getEmail() + " existe déjà");
        }

        String password = demande.getMotDePasse() != null
                ? demande.getMotDePasse()
                : passwordEncoder.encode(UUID.randomUUID().toString().substring(0, 12));

        Membre nouveauMembre = Membre.builder()
                .nom(demande.getNom())
                .prenom(demande.getPrenom())
                .email(demande.getEmail())
                .motDePasse(password)
                .statut(demande.getTypeMembreDemande())
                .active(true)
                .systemRole(RoleSysteme.MEMBRE)
                .dateEmbauche(LocalDateTime.now().toLocalDate())
                .etablissementOrigine(demande.getNomFaculte())
                .laboratoireOrigine(demande.getNomLaboOrigine())
                .biographie(demande.getBiographie())
                .centresInteret(demande.getCentresInteret())
                .photo(demande.getPhotoPath())
                .build();

        Membre membreSauve = membreRepository.save(nouveauMembre);

        if (demande.getEquipeId() != null) {
            equipeRepository.findById(demande.getEquipeId()).ifPresent(equipe -> {
                AffiliationMembre affiliation = AffiliationMembre.builder()
                        .membre(membreSauve)
                        .equipe(equipe)
                        .dateDebut(java.time.LocalDate.now())
                        .actif(true)
                        .build();
                affiliationRepository.save(affiliation);
            });
        }

        demande.setStatut(StatutDemande.ACCEPTEE);
        demande.setDateDecision(LocalDateTime.now());
        demande.setDecidePar(directeur);
        demandeRepository.save(demande);

        // notification envoyée après commit pour éviter les conflits de transaction
    }

    @Override
    @Transactional
    public DemandeAdhesion uploadCV(Long demandeId, org.springframework.web.multipart.MultipartFile file) {
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAdhesion", "id", demandeId));
        String path = fileStorageService.uploadFile(file, "pdfs");
        demande.setCvPath(path);
        return demandeRepository.save(demande);
    }

    @Override
    @Transactional
    public DemandeAdhesion uploadPhoto(Long demandeId, org.springframework.web.multipart.MultipartFile file) {
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAdhesion", "id", demandeId));
        String path = fileStorageService.uploadFile(file, "images");
        demande.setPhotoPath(path);
        return demandeRepository.save(demande);
    }

    @Override
    public org.springframework.core.io.Resource downloadCV(Long demandeId) {
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAdhesion", "id", demandeId));
        if (demande.getCvPath() == null) {
            throw new RuntimeException("Aucun CV disponible pour cette demande");
        }
        return fileStorageService.loadFileAsResource(demande.getCvPath());
    }

    @Override
    @Transactional
    public void refuserDemande(Long demandeId, Long directeurId, String commentaire) {
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAdhesion", "id", demandeId));

        Membre directeur = membreRepository.findById(directeurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", directeurId));

        demande.setStatut(StatutDemande.REFUSEE);
        demande.setDateDecision(LocalDateTime.now());
        demande.setDecidePar(directeur);
        demande.setCommentaireRefus(commentaire);
        demandeRepository.save(demande);
    }
}
