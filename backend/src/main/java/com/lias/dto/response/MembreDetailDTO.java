package com.lias.dto.response;

import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutMembre;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class MembreDetailDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String photo;
    private String biographie;
    private String centresInteret;
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private String etablissementOrigine;
    private String laboratoireOrigine;
    private StatutMembre statut;
    private Boolean active;
    private RoleSysteme systemRole;
    private List<AffiliationDTO> affiliations;
    private List<RoleDTO> roles;
    private List<PublicationSimpleDTO> publications;
}
