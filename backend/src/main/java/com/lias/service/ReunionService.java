package com.lias.service;

import com.lias.dto.request.ReunionRequestDTO;
import com.lias.entity.ParticipantReunion;
import com.lias.entity.Reunion;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ReunionService {
    List<Reunion> getAllReunions();
    Reunion getReunionById(Long id);
    Reunion creerReunion(ReunionRequestDTO dto, Long creeParId);
    void marquerPresence(Long reunionId, Long membreId, Boolean present);
    List<ParticipantReunion> getParticipants(Long reunionId);
    void ajouterParticipant(Long reunionId, Long membreId);
    void retirerParticipant(Long reunionId, Long membreId);
    void uploadPV(Long reunionId, MultipartFile file, Long membreId);
    Resource downloadPV(Long reunionId);
}
