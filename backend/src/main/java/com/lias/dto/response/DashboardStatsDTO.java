package com.lias.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long nbMembres;
    private long nbPublications;
    private long nbEvenements;
    private long nbDoctorants;
    private long nbEquipes;
    private long nbConventionsActives;
    private long nbDemandesEnAttente;
    private Map<String, Long> publicationsParAnnee;
    private Map<String, Long> membresParStatut;
    private Map<String, Long> evenementsParType;
}
