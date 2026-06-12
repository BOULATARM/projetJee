package com.lias.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProcesVerbalRequestDTO {
    @NotBlank
    private String titre;

    @NotNull
    private LocalDate date;

    private String contenu;
    private String fichierUrl;
    private Long reunionId;
}
