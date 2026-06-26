package com.lias.entity;

import com.lias.enums.ActionEquipe;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipe_historique", indexes = {
        @Index(name = "idx_equipe_historique_equipe", columnList = "equipe_id"),
        @Index(name = "idx_equipe_historique_date", columnList = "date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipeHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_id")
    @JsonIgnoreProperties({"affiliations", "publications", "laboratoire", "chefEquipe"})
    private Equipe equipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"affiliations", "roles", "documentsUploades", "demandesAdhesion", "demandesMateriel"})
    private Membre membre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    @JsonIgnoreProperties({"affiliations", "roles", "documentsUploades", "demandesAdhesion", "demandesMateriel"})
    private Membre performedBy;

    @Enumerated(EnumType.STRING)
    private ActionEquipe action;

    private LocalDateTime date;

    private String details;
}
