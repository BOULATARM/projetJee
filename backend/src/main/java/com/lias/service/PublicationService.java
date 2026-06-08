package com.lias.service;

import com.lias.dto.request.PublicationRequestDTO;
import com.lias.dto.response.PublicationResponseDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface PublicationService {
    PublicationResponseDTO ajouterPublication(PublicationRequestDTO dto, MultipartFile fichierPdf, Long membreId);
    List<PublicationResponseDTO> getAllPublications();
    PublicationResponseDTO getPublicationById(Long id);
    PublicationResponseDTO updatePublication(Long id, PublicationRequestDTO dto);
    void deletePublication(Long id);
    List<PublicationResponseDTO> getPublicationsByMembre(Long membreId);
    List<PublicationResponseDTO> getPublicationsByEquipe(Long equipeId);
    List<PublicationResponseDTO> getPublicationsByAnnee(Integer annee);
    List<PublicationResponseDTO> getAllPublicationsFiltered(Long auteurId, Integer annee, Long equipeId);
}
