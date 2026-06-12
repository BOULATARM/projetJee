package com.lias.entity;

import com.lias.enums.StatutDocument;
import com.lias.enums.TypeDocument;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String cheminFichier;

    @Enumerated(EnumType.STRING)
    private TypeDocument typeDocument;

    private LocalDateTime dateUpload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploade_par_id")
    @JsonIgnoreProperties({"documentsUploades", "affiliations", "roles", "demandesAdhesion", "demandesMateriel"})
    private Membre uploadePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evenement_id")
    @JsonIgnoreProperties("documents")
    private Evenement evenement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reunion_id")
    @JsonIgnoreProperties("documents")
    private Reunion reunion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id")
    @JsonIgnoreProperties("documents")
    private Convention convention;

    private Long taille;
    private String mimeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDocument statut = StatutDocument.PENDING;

    private String motifRefus;

    private LocalDateTime dateDecision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approuve_par_id")
    @JsonIgnoreProperties({"documentsUploades", "affiliations", "roles", "demandesAdhesion", "demandesMateriel"})
    private Membre approuvePar;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
