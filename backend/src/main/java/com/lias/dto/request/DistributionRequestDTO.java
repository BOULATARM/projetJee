package com.lias.dto.request;

import com.lias.enums.TypeMateriel;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DistributionRequestDTO {
    @NotNull private Long materielId;
    @NotNull private Long membreId;
    @NotNull private Integer quantite;
    private String commentaire;
    private TypeMateriel typeMateriel;
    private LocalDate datePrise;
    private LocalDate dateRetourPrevue;
}
