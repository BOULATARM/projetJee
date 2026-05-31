package com.lias.dto.response;

import com.lias.enums.RoleSysteme;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token;
    private String type = "Bearer";
    private Long membreId;
    private String email;
    private RoleSysteme role;
    private String nom;
    private String prenom;
}
