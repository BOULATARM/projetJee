package com.lias.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.lias.enums.StatutMembre;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DemandeAdhesionRequestDTO {
    @NotBlank private String nom;
    @NotBlank private String prenom;
    @NotBlank @Email private String email;
    @NotBlank private String motDePasse;
    private String motivation;
    private String cvPath;
    private StatutMembre typeMembreDemande;
    private String nomFaculte;        // affiché si PERMANENT
    private String nomLaboOrigine;    // affiché si ASSOCIE
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateEmbauche;
    private String biographie;
    private String centresInteret;
    private String publications;
    private Long equipeId;
}
