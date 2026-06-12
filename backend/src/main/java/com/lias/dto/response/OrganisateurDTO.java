package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganisateurDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String photo;
    private String roleOrganisation;
}
