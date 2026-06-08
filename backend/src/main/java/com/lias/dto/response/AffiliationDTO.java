package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class AffiliationDTO {
    private Long id;
    private String equipeNom;
    private Long equipeId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Boolean actif;
    private String motifDepart;
}
