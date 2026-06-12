package com.lias.entity;

import com.lias.enums.StatutDemande;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_participation",
       uniqueConstraints = @UniqueConstraint(columnNames = {"membre_id", "evenement_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id", nullable = false)
    @JsonIgnoreProperties({"affiliations","roles","demandesAdhesion","demandesMateriel","documentsUploades","motDePasse"})
    private Membre membre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evenement_id", nullable = false)
    @JsonIgnoreProperties({"organisateurs","participants"})
    private Evenement evenement;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutDemande statut = StatutDemande.PENDING;

    private LocalDateTime dateDemande;
    private LocalDateTime dateDecision;
    private String commentaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decide_par_id")
    @JsonIgnoreProperties({"affiliations","roles","demandesAdhesion","demandesMateriel","documentsUploades","motDePasse"})
    private Membre decidePar;
}
