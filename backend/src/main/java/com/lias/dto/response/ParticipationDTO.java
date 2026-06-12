package com.lias.dto.response;

import com.lias.enums.StatutParticipation;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ParticipationDTO {
    private Long id;
    private Long membreId;
    private String prenom;
    private String nom;
    private String photo;
    private String statutMembre;
    private StatutParticipation statut;
    private LocalDateTime dateInscription;
}
