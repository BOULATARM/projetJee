package com.lias.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MaterielRequestDTO {
    @NotBlank private String nom;
    private String description;
    private Integer quantiteTotale;
    private String categorie;
    private LocalDate dateArrivage;
}
