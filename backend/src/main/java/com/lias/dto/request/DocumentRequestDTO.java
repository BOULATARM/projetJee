package com.lias.dto.request;

import com.lias.enums.TypeDocument;
import lombok.Data;

@Data
public class DocumentRequestDTO {
    private String nom;
    private String description;
    private TypeDocument typeDocument;
    private Long evenementId;
    private Long reunionId;
    private Long conventionId;
}
