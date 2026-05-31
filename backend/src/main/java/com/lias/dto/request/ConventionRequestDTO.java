package com.lias.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ConventionRequestDTO {
    @NotBlank private String titre;
    private String partenaire;
    private String typePartenaire;
    private String paysPartenaire;
    private LocalDate dateSignature;
    private LocalDate dateExpiration;
    private String description;
}
