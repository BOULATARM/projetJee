package com.lias.service.impl;

import com.lias.entity.AuditLog;
import com.lias.entity.Mandat;
import com.lias.entity.Membre;
import com.lias.enums.RoleSysteme;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.AuditLogRepository;
import com.lias.repository.LaboratoireRepository;
import com.lias.repository.MandatRepository;
import com.lias.repository.MembreRepository;
import com.lias.service.MandatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MandatServiceImpl implements MandatService {

    private final MandatRepository mandatRepository;
    private final MembreRepository membreRepository;
    private final LaboratoireRepository laboratoireRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public Mandat getMandatActif() {
        return mandatRepository.findByActifTrue()
                .orElseThrow(() -> new ResourceNotFoundException("Mandat", "actif", true));
    }

    @Override
    @Transactional
    public Mandat creerMandat(Long directeurId, Long viceDirecteurId, LocalDate dateDebut, String adminEmail) {
        Membre directeur = membreRepository.findById(directeurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", directeurId));
        Membre viceDirecteur = viceDirecteurId != null ?
                membreRepository.findById(viceDirecteurId)
                        .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", viceDirecteurId))
                : null;

        mandatRepository.findByActifTrue().ifPresent(m -> {
            m.setActif(false);
            m.setDateFin(dateDebut.minusDays(1));
            mandatRepository.save(m);
        });

        directeur.setSystemRole(RoleSysteme.DIRECTEUR);
        membreRepository.save(directeur);

        if (viceDirecteur != null) {
            viceDirecteur.setSystemRole(RoleSysteme.VICE_DIRECTEUR);
            membreRepository.save(viceDirecteur);
        }

        java.util.List<com.lias.entity.Laboratoire> labos = laboratoireRepository.findAll();
        com.lias.entity.Laboratoire labo = labos.isEmpty() ? null : labos.get(0);

        Mandat mandat = Mandat.builder()
                .laboratoire(labo)
                .dateDebut(dateDebut)
                .actif(true)
                .directeur(directeur)
                .viceDirecteur(viceDirecteur)
                .build();

        Mandat saved = mandatRepository.save(mandat);

        auditLogRepository.save(AuditLog.builder()
                .entite("Mandat").action("CREATION_MANDAT")
                .methode("POST /mandats")
                .utilisateur(adminEmail)
                .membreId(directeurId)
                .date(LocalDateTime.now())
                .details("Nouveau mandat créé — Directeur: " + directeur.getPrenom() + " " + directeur.getNom()
                        + (viceDirecteur != null ? ", Vice-directeur: " + viceDirecteur.getPrenom() + " " + viceDirecteur.getNom() : "")
                        + " — Début: " + dateDebut)
                .build());

        return saved;
    }

    @Override
    @Transactional
    public void cloturerMandat(Long mandatId, LocalDate dateFin, String adminEmail) {
        Mandat mandat = mandatRepository.findById(mandatId)
                .orElseThrow(() -> new ResourceNotFoundException("Mandat", "id", mandatId));
        mandat.setActif(false);
        mandat.setDateFin(dateFin);

        if (mandat.getDirecteur() != null) {
            mandat.getDirecteur().setSystemRole(RoleSysteme.MEMBRE);
            membreRepository.save(mandat.getDirecteur());
        }
        if (mandat.getViceDirecteur() != null) {
            mandat.getViceDirecteur().setSystemRole(RoleSysteme.MEMBRE);
            membreRepository.save(mandat.getViceDirecteur());
        }

        mandatRepository.save(mandat);

        auditLogRepository.save(AuditLog.builder()
                .entite("Mandat").action("CLOTURE_MANDAT")
                .methode("PUT /mandats/" + mandatId + "/cloture")
                .utilisateur(adminEmail)
                .membreId(mandatId)
                .date(LocalDateTime.now())
                .details("Mandat #" + mandatId + " clôturé — Date fin: " + dateFin)
                .build());
    }

    @Override
    public List<Mandat> getHistoriqueMandats() {
        return mandatRepository.findAllByOrderByDateDebutDesc();
    }
}
