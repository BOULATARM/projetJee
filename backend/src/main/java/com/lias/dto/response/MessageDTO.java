package com.lias.dto.response;

import com.lias.entity.MessageType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class MessageDTO {
    private Long id;
    private MembreResponseDTO sender;
    private String contenu;
    private String fichierUrl;
    private String fichierNom;
    private String fichierType;
    private MessageType type;
    private MembreResponseDTO recipient;
    private Long equipeId;
    private String equipeNom;
    private LocalDateTime dateEnvoi;
    private boolean lue;
}
