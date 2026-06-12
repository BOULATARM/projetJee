package com.lias.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lias.enums.TypeMateriel;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "materiels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Materiel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    private String description;
    private Integer quantiteTotale;
    private Integer quantiteDisponible;
    private LocalDate dateArrivage;
    private String categorie;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TypeMateriel typeMateriel = TypeMateriel.DEFINITIF;

    @OneToMany(mappedBy = "materiel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("materiel")
    @Builder.Default
    private List<DistributionMateriel> distributions = new ArrayList<>();

    @OneToMany(mappedBy = "materiel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("materiel")
    @Builder.Default
    private List<MaterielHistorique> historique = new ArrayList<>();
}
