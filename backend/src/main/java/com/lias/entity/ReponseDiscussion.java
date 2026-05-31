package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "reponses_discussions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReponseDiscussion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id")
    @JsonIgnoreProperties({"affiliations", "roles"})
    private Membre auteur;

    private LocalDateTime dateCreation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id")
    @JsonIgnoreProperties("reponses")
    private Discussion discussion;
}
