package com.lias.dto.response;

import com.lias.enums.StatutEvenement;
import com.lias.enums.TypeEvenement;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class EvenementResponseDTO {
    private Long id;
    private String titre;
    private String description;
    private TypeEvenement type;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String lieu;
    private Integer edition;
    private Integer annee;
    private StatutEvenement statut;
    private List<OrganisateurDTO> organisateurs;
    private Integer nbDocuments;
}
