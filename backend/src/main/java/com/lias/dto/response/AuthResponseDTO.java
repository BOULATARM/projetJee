package com.lias.dto.response;

import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutMembre;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long membreId;
    private String email;
    private RoleSysteme role;
    private StatutMembre statut;
    private String nom;
    private String prenom;
    private String photo;
}
