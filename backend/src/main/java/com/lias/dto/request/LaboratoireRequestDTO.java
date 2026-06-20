package com.lias.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LaboratoireRequestDTO {
    @NotBlank
    private String nom;
    private String acronyme;
    private String description;
    private String adresse;
    private LocalDate dateCreation;
    private String axesDeRecherche;
}
