package com.lias.dto.response;

import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutMembre;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class MembreResponseDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String photo;
    private String biographie;
    private String centresInteret;
    private LocalDate dateEmbauche;
    private String etablissementOrigine;
    private String laboratoireOrigine;
    private StatutMembre statut;
    private Boolean active;
    private RoleSysteme roleActuel;
    private String equipeActuelle;
    private Long equipeId;
}
