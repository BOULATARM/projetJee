package com.lias.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EquipeRequestDTO {
    private String nom;
    private String description;
    private String axeRecherche;
    private LocalDate dateCreation;
    private Long chefEquipeId;
}
