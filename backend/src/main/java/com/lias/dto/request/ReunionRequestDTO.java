package com.lias.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReunionRequestDTO {
    @NotBlank private String titre;
    private LocalDateTime dateReunion;
    private String lieu;
    private String ordreJour;
    private List<Long> participantIds;
}
