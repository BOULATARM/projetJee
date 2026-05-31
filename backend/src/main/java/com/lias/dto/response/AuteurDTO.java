package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuteurDTO {
    private Long id;
    private String nom;
    private String prenom;
    private Integer ordreAuteur;
    private Boolean auteurCorrespondant;
}
