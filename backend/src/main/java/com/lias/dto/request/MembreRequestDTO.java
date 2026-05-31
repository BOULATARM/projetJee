package com.lias.dto.request;

import com.lias.enums.StatutMembre;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MembreRequestDTO {
    @NotBlank private String nom;
    @NotBlank private String prenom;
    @NotBlank @Email private String email;
    private String photo;
    private String biographie;
    private String centresInteret;
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private String etablissementOrigine;
    private String laboratoireOrigine;
    private StatutMembre statut;
}
