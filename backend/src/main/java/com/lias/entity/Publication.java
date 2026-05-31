package com.lias.entity;

import com.lias.enums.TypePublication;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "publications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String resume;

    private Integer annee;
    private String doi;
    private String lienUrl;

    @Enumerated(EnumType.STRING)
    private TypePublication typePub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_id")
    @JsonIgnoreProperties({"publications", "affiliations", "laboratoire"})
    private Equipe equipe;

    private LocalDateTime dateAjout;

    private String fichierPath;

    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("publication")
    @Builder.Default
    private List<AuteurPublication> auteurs = new ArrayList<>();
}
