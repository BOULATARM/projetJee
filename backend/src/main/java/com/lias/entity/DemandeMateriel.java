package com.lias.entity;

import com.lias.enums.StatutDemande;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_materiel")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeMateriel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"demandesMateriel", "affiliations", "roles"})
    private Membre membre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String justification;

    private Integer quantite = 1;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut = StatutDemande.PENDING;

    private LocalDateTime dateDemande;
    private LocalDateTime dateTraitement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traite_par_id")
    @JsonIgnoreProperties({"affiliations", "roles", "demandesMaterielTraitees"})
    private Membre traitePar;
}
