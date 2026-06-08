package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class RapportAnnuelDTO {
    private Long id;
    private Integer annee;
    private LocalDateTime dateGeneration;
    private String generePar;
    private String statut;
    private int nbPublications;
    private int nbEvenements;
    private int nbMembres;
    private int nbDoctorants;
    private List<PublicationResponseDTO> publications;
    private List<EvenementResponseDTO> evenements;
    private List<MembreResponseDTO> membres;
    private Map<String, Long> publicationsParType;
    private Map<String, Long> membresParStatut;
    private String activites;
}
