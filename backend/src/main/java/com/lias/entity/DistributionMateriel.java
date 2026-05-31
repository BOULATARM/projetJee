package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@Entity
@Table(name = "distributions_materiel")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistributionMateriel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materiel_id")
    @JsonIgnoreProperties("distributions")
    private Materiel materiel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"affiliations", "roles", "documentsUploades", "demandesAdhesion", "demandesMateriel"})
    private Membre membre;

    private Integer quantite;
    private LocalDate dateDistribution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distribute_par_id")
    @JsonIgnoreProperties({"affiliations", "roles"})
    private Membre distributePar;

    private String commentaire;
}
