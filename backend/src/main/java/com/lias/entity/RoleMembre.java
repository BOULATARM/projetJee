package com.lias.entity;

import com.lias.enums.RoleSysteme;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@Entity
@Table(name = "roles_membres")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleMembre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"roles", "affiliations", "documentsUploades", "demandesAdhesion", "demandesMateriel"})
    private Membre membre;

    @Enumerated(EnumType.STRING)
    private RoleSysteme role;

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mandat_id")
    @JsonIgnoreProperties("rolesMembres")
    private Mandat mandat;
}
