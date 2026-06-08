package com.lias.entity;

import com.lias.enums.StatutRapport;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "rapports_annuels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RapportAnnuel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer annee;
    private LocalDateTime dateGeneration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genere_par_id")
    @JsonIgnoreProperties({"affiliations", "roles"})
    private Membre generePar;

    private String cheminFichier;
    private Integer nbPublications;
    private Integer nbEvenements;
    private Integer nbMembres;
    private Integer nbDoctorants;

    @Enumerated(EnumType.STRING)
    private StatutRapport statut = StatutRapport.BROUILLON;

    @Column(columnDefinition = "TEXT")
    private String activites;
}
