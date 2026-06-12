package com.lias.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "materiels_historique")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterielHistorique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materiel_id")
    @JsonIgnoreProperties({"historique", "distributions"})
    private Materiel materiel;

    private String action;

    @Column(columnDefinition = "TEXT")
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fait_par_id")
    @JsonIgnoreProperties({"affiliations", "roles", "demandesMateriel"})
    private Membre faitPar;

    @CreationTimestamp
    private LocalDateTime dateAction;
}
