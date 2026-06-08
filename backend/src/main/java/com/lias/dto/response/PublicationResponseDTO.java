package com.lias.dto.response;

import com.lias.enums.TypePublication;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PublicationResponseDTO {
    private Long id;
    private String titre;
    private String resume;
    private Integer annee;
    private String doi;
    private String lienUrl;
    private String revue;
    private String conference;
    private TypePublication typePub;
    private LocalDateTime dateAjout;
    private String fichierPath;
    private List<AuteurDTO> auteurs;
    private String equipe;
    private Long equipeId;
}
