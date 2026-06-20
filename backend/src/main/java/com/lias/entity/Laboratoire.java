package com.lias.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "laboratoires")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Laboratoire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate dateCreation;

    private String acronyme;

    private String logo;

    private String adresse;

    @Column(columnDefinition = "TEXT")
    private String axesDeRecherche;

    @OneToMany(mappedBy = "laboratoire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("laboratoire")
    @Builder.Default
    private List<Equipe> equipes = new ArrayList<>();

    @OneToMany(mappedBy = "laboratoire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("laboratoire")
    @Builder.Default
    private List<Mandat> mandats = new ArrayList<>();

    @OneToMany(mappedBy = "laboratoire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("laboratoire")
    @Builder.Default
    private List<Evenement> evenements = new ArrayList<>();

    @OneToMany(mappedBy = "laboratoire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("laboratoire")
    @Builder.Default
    private List<Convention> conventions = new ArrayList<>();
}
