package com.lias.dto.request;

import com.lias.enums.TypePublication;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class PublicationRequestDTO {
    @NotBlank private String titre;
    private String resume;
    private Integer annee;
    private String doi;
    private String lienUrl;
    private String revue;
    private String conference;
    private TypePublication typePublication;
    private Long equipeId;
    private List<Long> auteurIds;
    private List<Integer> ordresAuteurs;
}
