package com.lias.dto.response;

import com.lias.enums.RoleSysteme;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class RoleDTO {
    private Long id;
    private RoleSysteme role;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Boolean actif;
}
