package com.lias.entity;

import com.lias.enums.StatutEvenement;
import com.lias.enums.TypeEvenement;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evenements")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evenement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TypeEvenement type;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String lieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratoire_id")
    @JsonIgnoreProperties({"evenements", "equipes", "mandats", "conventions"})
    private Laboratoire laboratoire;

    private Integer edition;
    private Integer annee;

    @Enumerated(EnumType.STRING)
    private StatutEvenement statut = StatutEvenement.PLANIFIE;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "evenement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("evenement")
    @Builder.Default
    private List<OrganisateurEvenement> organisateurs = new ArrayList<>();

    @OneToMany(mappedBy = "evenement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("evenement")
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @OneToMany(mappedBy = "evenement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("evenement")
    @Builder.Default
    private List<ParticipationEvenement> participations = new ArrayList<>();
}
