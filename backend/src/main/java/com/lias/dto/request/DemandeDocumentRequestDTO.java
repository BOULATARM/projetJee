package com.lias.dto.request;

import com.lias.enums.TypeDocument;
import lombok.Data;

@Data
public class DemandeDocumentRequestDTO {
    private String titre;
    private String description;
    private TypeDocument typeDocument;
}
