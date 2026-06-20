package com.lias.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Membre sender;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    // fichier attaché (chemin dans uploads/)
    private String fichierUrl;
    private String fichierNom;
    private String fichierType; // mime type

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    // pour DIRECT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private Membre recipient;

    // pour TEAM
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;

    // pour EVENT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evenement_id")
    private Evenement evenement;

    @CreationTimestamp
    private LocalDateTime dateEnvoi;

    @Builder.Default
    private boolean lue = false;
}
