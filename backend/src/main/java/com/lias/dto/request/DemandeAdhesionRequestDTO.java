package com.lias.dto.request;

import com.lias.enums.StatutMembre;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DemandeAdhesionRequestDTO {
    @NotBlank private String nom;
    @NotBlank private String prenom;
    @NotBlank @Email private String email;
    private String motivation;
    private String cvPath;
    private StatutMembre typeMembreDemande;
}
