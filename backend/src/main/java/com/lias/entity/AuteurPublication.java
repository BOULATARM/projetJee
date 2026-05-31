package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "auteurs_publications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuteurPublication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"publications", "affiliations", "roles", "documentsUploades", "demandesAdhesion", "demandesMateriel"})
    private Membre membre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publication_id")
    @JsonIgnoreProperties("auteurs")
    private Publication publication;

    private Integer ordreAuteur;
    private Boolean auteurCorrespondant = false;
}
