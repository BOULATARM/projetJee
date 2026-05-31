package com.lias.dto.request;

import com.lias.enums.TypeEvenement;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvenementRequestDTO {
    @NotBlank private String titre;
    private String description;
    private TypeEvenement type;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String lieu;
    private Integer edition;
    private Integer annee;
}
