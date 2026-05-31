package com.lias.entity;

import com.lias.enums.StatutReunion;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reunions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reunion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titre;

    private LocalDateTime dateReunion;
    private String lieu;

    @Column(columnDefinition = "TEXT")
    private String ordreJour;

    @Enumerated(EnumType.STRING)
    private StatutReunion statut = StatutReunion.PLANIFIEE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par_id")
    @JsonIgnoreProperties({"affiliations", "roles", "documentsUploades", "demandesAdhesion", "demandesMateriel"})
    private Membre creePar;

    @OneToMany(mappedBy = "reunion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("reunion")
    @Builder.Default
    private List<ParticipantReunion> participants = new ArrayList<>();

    @OneToMany(mappedBy = "reunion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("reunion")
    @Builder.Default
    private List<Document> documents = new ArrayList<>();
}
