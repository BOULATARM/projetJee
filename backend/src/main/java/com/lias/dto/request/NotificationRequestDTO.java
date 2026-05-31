package com.lias.dto.request;

import com.lias.enums.TypeNotification;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequestDTO {
    @NotNull private Long destinataireId;
    @NotNull private String message;
    @NotNull private TypeNotification type;
    private String lien;
}
