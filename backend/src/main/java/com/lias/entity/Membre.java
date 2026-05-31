package com.lias.entity;

import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutMembre;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "membres")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Membre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @Email
    @Column(unique = true)
    private String email;

    @JsonIgnoreProperties
    private String motDePasse;

    private String photo;
    private String biographie;
    private String centresInteret;
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private String etablissementOrigine;
    private String laboratoireOrigine;

    @Enumerated(EnumType.STRING)
    private StatutMembre statut;

    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    private RoleSysteme systemRole;

    @OneToMany(mappedBy = "membre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("membre")
    @Builder.Default
    private List<AffiliationMembre> affiliations = new ArrayList<>();

    @OneToMany(mappedBy = "membre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("membre")
    @Builder.Default
    private List<RoleMembre> roles = new ArrayList<>();

    @OneToMany(mappedBy = "decidePar", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("decidePar")
    @Builder.Default
    private List<DemandeAdhesion> demandesAdhesion = new ArrayList<>();

    @OneToMany(mappedBy = "membre", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("membre")
    @Builder.Default
    private List<DemandeMateriel> demandesMateriel = new ArrayList<>();

    @OneToMany(mappedBy = "uploadePar", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("uploadePar")
    @Builder.Default
    private List<Document> documentsUploades = new ArrayList<>();

    @Override
    public String toString() {
        return "Membre{id=" + id + ", email='" + email + "'}";
    }
}
