package com.lias.service.impl;

import com.lias.dto.request.LaboratoireRequestDTO;
import com.lias.entity.Laboratoire;
import com.lias.repository.LaboratoireRepository;
import com.lias.security.UserPrincipal;
import com.lias.service.AuditLogService;
import com.lias.service.LaboratoireService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class LaboratoireServiceImpl implements LaboratoireService {

    private final LaboratoireRepository laboratoireRepository;
    private final AuditLogService auditLogService;

    @Override
    public Laboratoire getLaboratoire() {
        return laboratoireRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Laboratoire non trouvé"));
    }

    @Override
    @Transactional
    public Laboratoire modifierLaboratoire(LaboratoireRequestDTO dto) {
        Laboratoire labo = getLaboratoire();

        // Calculer le diff avant modification
        List<String> changes = new ArrayList<>();
        if (!Objects.equals(labo.getNom(), dto.getNom()))
            changes.add("Nom : \"" + labo.getNom() + "\" → \"" + dto.getNom() + "\"");
        if (!Objects.equals(labo.getAcronyme(), dto.getAcronyme()))
            changes.add("Acronyme : \"" + labo.getAcronyme() + "\" → \"" + dto.getAcronyme() + "\"");
        if (!Objects.equals(labo.getDescription(), dto.getDescription()))
            changes.add("Description modifiée");
        if (!Objects.equals(labo.getAdresse(), dto.getAdresse()))
            changes.add("Adresse : \"" + labo.getAdresse() + "\" → \"" + dto.getAdresse() + "\"");
        if (!Objects.equals(labo.getDateCreation(), dto.getDateCreation()))
            changes.add("Date de création : " + labo.getDateCreation() + " → " + dto.getDateCreation());
        if (!Objects.equals(labo.getAxesDeRecherche(), dto.getAxesDeRecherche()))
            changes.add("Axes de recherche modifiés");

        // Appliquer les modifications
        labo.setNom(dto.getNom());
        labo.setAcronyme(dto.getAcronyme());
        labo.setDescription(dto.getDescription());
        labo.setAdresse(dto.getAdresse());
        labo.setDateCreation(dto.getDateCreation());
        labo.setAxesDeRecherche(dto.getAxesDeRecherche());
        Laboratoire saved = laboratoireRepository.save(labo);

        // Log manuel avec le diff
        String details = changes.isEmpty() ? "Aucun changement détecté" : String.join(" | ", changes);
        auditLogService.log("Laboratoire", "UPDATE", "modifierLaboratoire",
                getCurrentUser(), getCurrentMembreId(), details);

        return saved;
    }

    private String getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "system";
    }

    private Long getCurrentMembreId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
                return up.getMembreId();
            }
        } catch (Exception ignored) {}
        return null;
    }
}
