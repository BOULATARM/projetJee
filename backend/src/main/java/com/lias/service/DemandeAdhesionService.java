package com.lias.service;

import com.lias.dto.request.DemandeAdhesionRequestDTO;
import com.lias.entity.DemandeAdhesion;
import java.util.List;

public interface DemandeAdhesionService {
    DemandeAdhesion soumettreDemandePublique(DemandeAdhesionRequestDTO dto);
    List<DemandeAdhesion> getPendingDemandes();
    List<DemandeAdhesion> getAllDemandes();
    DemandeAdhesion getDemandeById(Long id);
    void accepterDemande(Long demandeId, Long directeurId);
    void refuserDemande(Long demandeId, Long directeurId, String commentaire);
    DemandeAdhesion uploadCV(Long demandeId, org.springframework.web.multipart.MultipartFile file);
    DemandeAdhesion uploadPhoto(Long demandeId, org.springframework.web.multipart.MultipartFile file);
    org.springframework.core.io.Resource downloadCV(Long demandeId);
}
