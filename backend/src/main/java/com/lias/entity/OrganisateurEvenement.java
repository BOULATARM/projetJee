package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "organisateurs_evenements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganisateurEvenement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evenement_id")
    @JsonIgnoreProperties("organisateurs")
    private Evenement evenement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"affiliations", "roles", "demandesAdhesion", "demandesMateriel", "documentsUploades"})
    private Membre membre;

    private String roleOrganisation;
}
