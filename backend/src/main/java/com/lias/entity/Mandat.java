package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mandats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mandat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratoire_id")
    @JsonIgnoreProperties({"mandats", "equipes", "evenements", "conventions"})
    private Laboratoire laboratoire;

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "directeur_id")
    @JsonIgnoreProperties({"affiliations", "roles", "mandatsDiriges", "mandatsViceDiriges"})
    private Membre directeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vice_directeur_id")
    @JsonIgnoreProperties({"affiliations", "roles", "mandatsDiriges", "mandatsViceDiriges"})
    private Membre viceDirecteur;

    @OneToMany(mappedBy = "mandat", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("mandat")
    @Builder.Default
    private List<RoleMembre> rolesMembres = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "mandat_chefs_equipe",
            joinColumns = @JoinColumn(name = "mandat_id"),
            inverseJoinColumns = @JoinColumn(name = "membre_id"))
    @JsonIgnoreProperties({"affiliations", "roles", "demandesAdhesion", "demandesMateriel", "documentsUploades"})
    @Builder.Default
    private List<Membre> chefsEquipe = new ArrayList<>();
}
