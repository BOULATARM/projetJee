package com.lias.entity;

import com.lias.enums.StatutDemande;
import com.lias.enums.TypeDocument;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TypeDocument typeDocument;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutDemande statut = StatutDemande.PENDING;

    @Column(columnDefinition = "TEXT")
    private String motifRefus;

    private LocalDateTime dateCreation;
    private LocalDateTime dateTraitement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandeur_id")
    @JsonIgnoreProperties({"affiliations", "roles", "demandesAdhesion"})
    private Membre demandeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traite_par_id")
    @JsonIgnoreProperties({"affiliations", "roles", "demandesAdhesion"})
    private Membre traitePar;
}
