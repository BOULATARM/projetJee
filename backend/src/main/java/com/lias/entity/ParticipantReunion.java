package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "participants_reunions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantReunion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reunion_id")
    @JsonIgnoreProperties("participants")
    private Reunion reunion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"affiliations", "roles", "participationsReunions", "documentsUploades", "demandesAdhesion", "demandesMateriel", "mandats"})
    private Membre membre;

    private Boolean present;
}
