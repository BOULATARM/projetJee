package com.lias.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DemandeMaterielRequestDTO {
    private Long materielId;
    private String description;
    private String justification;
    private Integer quantite;
    private LocalDate datePriseSouhaitee;
    private LocalDate dateRetourPrevue;
}
