package com.lias.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DistributionRequestDTO {
    @NotNull private Long materielId;
    @NotNull private Long membreId;
    @NotNull private Integer quantite;
    private String commentaire;
}
