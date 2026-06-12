package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class RapportAnnuelDTO {
    private Long id;
    private Integer annee;
    private LocalDateTime dateGeneration;
    private String generePar;
    private String statut;

    // Chiffres clés
    private int nbMembres;
    private int nbDoctorants;
    private int nbPublications;
    private int nbEvenements;
    private int nbReunions;
    private int nbConventions;

    // Répartitions
    private Map<String, Long> publicationsParType;
    private Map<String, Long> membresParStatut;
    private Map<String, Long> evenementsParType;

    // Listes détaillées
    private List<PubItem> publications;
    private List<EvtItem> evenements;
    private List<ReuItem> reunions;
    private List<MemItem> membres;

    @Data @Builder
    public static class PubItem {
        private String titre;
        private String type;
        private String revue;
        private String conference;
        private int annee;
        private List<String> auteurs;
    }

    @Data @Builder
    public static class EvtItem {
        private String titre;
        private String type;
        private String statut;
        private String dateDebut;
        private String lieu;
        private int nbParticipants;
    }

    @Data @Builder
    public static class ReuItem {
        private String titre;
        private String date;
        private String lieu;
        private String statut;
        private int nbParticipants;
    }

    @Data @Builder
    public static class MemItem {
        private String nom;
        private String prenom;
        private String statut;
        private String email;
        private String equipe;
    }
}
