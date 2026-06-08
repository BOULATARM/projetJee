package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicationSimpleDTO {
    private Long id;
    private String titre;
    private Integer annee;
    private String type;
    private String lienUrl;
    private String doi;
}
