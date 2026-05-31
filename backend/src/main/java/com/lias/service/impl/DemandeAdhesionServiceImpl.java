package com.lias.service.impl;

import com.lias.dto.request.DemandeAdhesionRequestDTO;
import com.lias.entity.DemandeAdhesion;
import com.lias.entity.Membre;
import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutDemande;
import com.lias.enums.StatutMembre;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.DemandeAdhesionRepository;
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
    private final PasswordEncoder passwordEncoder;

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
                .motivation(dto.getMotivation())
                .cvPath(dto.getCvPath())
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

        Membre nouveauMembre = Membre.builder()
                .nom(demande.getNom())
                .prenom(demande.getPrenom())
                .email(demande.getEmail())
                .motDePasse(passwordEncoder.encode(UUID.randomUUID().toString().substring(0, 12)))
                .statut(demande.getTypeMembreDemande())
                .active(true)
                .systemRole(RoleSysteme.MEMBRE)
                .dateEmbauche(LocalDateTime.now().toLocalDate())
                .build();

        membreRepository.save(nouveauMembre);

        demande.setStatut(StatutDemande.ACCEPTEE);
        demande.setDateDecision(LocalDateTime.now());
        demande.setDecidePar(directeur);
        demandeRepository.save(demande);
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
