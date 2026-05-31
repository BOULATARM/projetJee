package com.lias.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "laboratoire", "affiliations", "publications"})
public class Equipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String axeRecherche;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratoire_id")
    @JsonIgnoreProperties("equipes")
    private Laboratoire laboratoire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chef_equipe_id")
    @JsonIgnoreProperties({"affiliations", "roles", "equipesDirigees"})
    private Membre chefEquipe;

    @OneToMany(mappedBy = "equipe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("equipe")
    @Builder.Default
    private List<AffiliationMembre> affiliations = new ArrayList<>();

    @OneToMany(mappedBy = "equipe", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("equipe")
    @Builder.Default
    private List<Publication> publications = new ArrayList<>();
}
