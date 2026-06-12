package com.lias.entity;

import com.lias.enums.StatutParticipation;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "participations_evenements",
       uniqueConstraints = @UniqueConstraint(columnNames = {"evenement_id", "membre_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipationEvenement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evenement_id", nullable = false)
    @JsonIgnoreProperties("participations")
    private Evenement evenement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id", nullable = false)
    @JsonIgnoreProperties({"affiliations", "roles", "demandesAdhesion", "demandesMateriel", "documentsUploades"})
    private Membre membre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutParticipation statut;

    @Column(updatable = false)
    private LocalDateTime dateInscription;

    @PrePersist
    void prePersist() {
        dateInscription = LocalDateTime.now();
    }
}
