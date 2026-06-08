package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinataire_id")
    @JsonIgnoreProperties({"affiliations", "roles", "notifications"})
    private Membre destinataire;

    private String message;

    @Column(length = 50)
    private String type;

    private String lien;
    private Boolean lue = false;
    private LocalDateTime dateCreation;
}
