package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_entite", columnList = "entite"),
        @Index(name = "idx_audit_utilisateur", columnList = "utilisateur"),
        @Index(name = "idx_audit_date", columnList = "date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String entite;
    private String action;
    private String methode;
    private String utilisateur;
    private Long membreId;
    private LocalDateTime date;

    @Column(columnDefinition = "TEXT")
    private String details;
}
