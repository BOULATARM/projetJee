package com.lias.service;

import com.lias.dto.request.EvenementRequestDTO;
import com.lias.dto.response.EvenementResponseDTO;
import com.lias.enums.StatutEvenement;
import java.time.LocalDateTime;
import java.util.List;

public interface EvenementService {
    EvenementResponseDTO creerEvenement(EvenementRequestDTO dto);
    List<EvenementResponseDTO> getAllEvenements();
    EvenementResponseDTO getEvenementById(Long id);
    EvenementResponseDTO updateEvenement(Long id, EvenementRequestDTO dto);
    List<EvenementResponseDTO> getEvenementsByAnnee(Integer annee);
    void affecterOrganisateur(Long evenementId, Long membreId, String role);
    void changerStatut(Long evenementId, StatutEvenement statut);
    List<EvenementResponseDTO> getEvenementsByDateRange(LocalDateTime debut, LocalDateTime fin);
}
