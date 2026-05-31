package com.lias.entity;

import com.lias.enums.StatutConvention;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conventions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Convention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titre;

    private String partenaire;
    private String typePartenaire;
    private String paysPartenaire;
    private LocalDate dateSignature;
    private LocalDate dateExpiration;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private StatutConvention statut = StatutConvention.EN_COURS_NEGOCIATION;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratoire_id")
    @JsonIgnoreProperties({"conventions", "equipes", "mandats", "evenements"})
    private Laboratoire laboratoire;

    @OneToMany(mappedBy = "convention", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("convention")
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @OneToMany(mappedBy = "convention", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("convention")
    @Builder.Default
    private List<ActiviteConvention> activites = new ArrayList<>();
}
