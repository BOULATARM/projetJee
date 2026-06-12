package com.lias.entity;

import com.lias.enums.StatutReunion;
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
@Table(name = "reunions")
@EntityListeners(AuditingEntityListener.class)
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

    @Column(columnDefinition = "TEXT")
    private String compteRendu;

    private String pvPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'PLANIFIEE'")
    private StatutReunion statut = StatutReunion.PLANIFIEE;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par_id")
    @JsonIgnoreProperties({"affiliations", "roles", "documentsUploades", "demandesAdhesion", "demandesMateriel"})
    private Membre creePar;

    @OneToMany(mappedBy = "reunion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("reunion")
    @Builder.Default
    private List<ParticipantReunion> participants = new ArrayList<>();

    @OneToMany(mappedBy = "reunion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"reunion", "uploadePar", "approuvePar"})
    @Builder.Default
    private List<Document> documents = new ArrayList<>();
}
