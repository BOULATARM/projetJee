package com.lias.entity;

import com.lias.enums.StatutDemande;
import com.lias.enums.StatutMembre;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_adhesion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeAdhesion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @Email
    private String email;

    private String cvPath;
    private String photoPath;
    private String motDePasse;

    @Column(columnDefinition = "TEXT")
    private String motivation;

    private String nomFaculte;       // pour PERMANENT
    private String nomLaboOrigine;   // pour ASSOCIE

    private java.time.LocalDate dateNaissance;
    private java.time.LocalDate dateEmbauche;

    @Column(columnDefinition = "TEXT")
    private String biographie;

    private String centresInteret;

    @Column(columnDefinition = "TEXT")
    private String publications;

    private Long equipeId;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut = StatutDemande.PENDING;

    private LocalDateTime dateDepot;
    private LocalDateTime dateDecision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decide_par_id")
    @JsonIgnoreProperties({"demandesAdhesion", "affiliations", "roles"})
    private Membre decidePar;

    @Column(columnDefinition = "TEXT")
    private String commentaireRefus;

    @Enumerated(EnumType.STRING)
    private StatutMembre typeMembreDemande;
}
