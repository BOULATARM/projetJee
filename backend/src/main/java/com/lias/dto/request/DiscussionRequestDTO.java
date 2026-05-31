package com.lias.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DiscussionRequestDTO {
    @NotBlank private String sujet;
    @NotBlank private String contenu;
    private Long evenementId;
    private Long equipeId;
}
