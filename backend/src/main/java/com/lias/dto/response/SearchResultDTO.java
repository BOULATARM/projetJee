package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SearchResultDTO {
    private String type;
    private Long id;
    private String titre;
    private String description;
    private String date;
    private String url;
}
