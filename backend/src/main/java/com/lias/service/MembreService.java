package com.lias.service;

import com.lias.dto.request.MembreRequestDTO;
import com.lias.dto.response.MembreDetailDTO;
import com.lias.dto.response.MembreResponseDTO;
import com.lias.enums.StatutMembre;
import java.util.List;

public interface MembreService {
    List<MembreResponseDTO> getAllMembres();
    MembreDetailDTO getMembreById(Long id);
    MembreResponseDTO updateProfil(Long id, MembreRequestDTO dto);
    void changeStatut(Long id, StatutMembre statut);
    void desactiverCompte(Long id);
    void reactiverCompte(Long id);
    List<MembreResponseDTO> getMembresParEquipe(Long equipeId);
    List<MembreResponseDTO> searchMembres(String keyword);
}
