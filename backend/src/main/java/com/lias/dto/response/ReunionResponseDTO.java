package com.lias.dto.response;

import com.lias.entity.Reunion;
import com.lias.enums.StatutReunion;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ReunionResponseDTO {
    private Long id;
    private String titre;
    private LocalDateTime dateReunion;
    private String lieu;
    private String ordreJour;
    private String compteRendu;
    private String pvPath;
    private StatutReunion statut;
    private LocalDateTime createdAt;

    private MembreSimple creePar;
    private List<ParticipantSimple> participants;
    private int nbDocuments;

    @Data
    public static class MembreSimple {
        private Long id;
        private String prenom;
        private String nom;
        private String photo;
    }

    @Data
    public static class ParticipantSimple {
        private Long id;
        private Long membreId;
        private String prenom;
        private String nom;
        private String photo;
        private Boolean present;
    }

    public static ReunionResponseDTO from(Reunion r) {
        ReunionResponseDTO dto = new ReunionResponseDTO();
        dto.setId(r.getId());
        dto.setTitre(r.getTitre());
        dto.setDateReunion(r.getDateReunion());
        dto.setLieu(r.getLieu());
        dto.setOrdreJour(r.getOrdreJour());
        dto.setCompteRendu(r.getCompteRendu());
        dto.setPvPath(r.getPvPath());
        dto.setStatut(r.getStatut());
        dto.setCreatedAt(r.getCreatedAt());

        if (r.getCreePar() != null) {
            MembreSimple ms = new MembreSimple();
            ms.setId(r.getCreePar().getId());
            ms.setPrenom(r.getCreePar().getPrenom());
            ms.setNom(r.getCreePar().getNom());
            ms.setPhoto(r.getCreePar().getPhoto());
            dto.setCreePar(ms);
        }

        if (r.getParticipants() != null) {
            dto.setParticipants(r.getParticipants().stream().map(p -> {
                ParticipantSimple ps = new ParticipantSimple();
                ps.setId(p.getId());
                ps.setPresent(p.getPresent());
                if (p.getMembre() != null) {
                    ps.setMembreId(p.getMembre().getId());
                    ps.setPrenom(p.getMembre().getPrenom());
                    ps.setNom(p.getMembre().getNom());
                    ps.setPhoto(p.getMembre().getPhoto());
                }
                return ps;
            }).collect(Collectors.toList()));
        }

        dto.setNbDocuments(r.getDocuments() != null ? r.getDocuments().size() : 0);
        return dto;
    }
}
