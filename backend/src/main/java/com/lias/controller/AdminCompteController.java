package com.lias.controller;

import com.lias.entity.AuditLog;
import com.lias.entity.Membre;
import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutMembre;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.AuditLogRepository;
import com.lias.repository.MembreRepository;
import com.lias.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/comptes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCompteController {

    private final MembreRepository membreRepository;
    private final AuditLogRepository auditLogRepository;

    /** Liste tous les membres, avec filtre optionnel par systemRole */
    @GetMapping
    public ResponseEntity<List<Membre>> getComptes(
            @RequestParam(required = false) String role) {
        List<Membre> membres;
        if (role != null && !role.isBlank()) {
            try {
                RoleSysteme r = RoleSysteme.valueOf(role.toUpperCase());
                membres = membreRepository.findBySystemRole(r);
            } catch (IllegalArgumentException e) {
                membres = membreRepository.findAll();
            }
        } else {
            membres = membreRepository.findAll();
        }
        return ResponseEntity.ok(membres);
    }

    /** Retourne les 5 rôles système disponibles */
    @GetMapping("/roles-systeme")
    public ResponseEntity<List<Map<String, String>>> getRolesSysteme() {
        List<Map<String, String>> roles = Arrays.asList(
            Map.of("code", "ADMIN",            "label", "Administrateur"),
            Map.of("code", "DIRECTEUR",        "label", "Directeur"),
            Map.of("code", "VICE_DIRECTEUR",   "label", "Vice-Directeur"),
            Map.of("code", "CHEF_EQUIPE",      "label", "Chef d'équipe"),
            Map.of("code", "MEMBRE",           "label", "Membre")
        );
        return ResponseEntity.ok(roles);
    }

    /** Désactiver un compte — enregistre la date et crée un log d'audit */
    @PutMapping("/{id}/desactiver")
    public ResponseEntity<Membre> desactiverCompte(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin) {

        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));

        membre.setActive(false);
        membre.setDateDesactivation(LocalDateTime.now());
        membreRepository.save(membre);

        auditLogRepository.save(AuditLog.builder()
                .entite("Membre")
                .action("DESACTIVATION_COMPTE")
                .methode("PUT /admin/comptes/" + id + "/desactiver")
                .utilisateur(admin.getEmail())
                .membreId(id)
                .date(LocalDateTime.now())
                .details("Compte de " + membre.getPrenom() + " " + membre.getNom()
                        + " désactivé par " + admin.getEmail())
                .build());

        return ResponseEntity.ok(membre);
    }

    /** Réactiver un compte */
    @PutMapping("/{id}/reactiver")
    public ResponseEntity<Membre> reactiverCompte(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal admin) {

        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));

        membre.setActive(true);
        membre.setDateDesactivation(null);
        membreRepository.save(membre);

        auditLogRepository.save(AuditLog.builder()
                .entite("Membre")
                .action("REACTIVATION_COMPTE")
                .methode("PUT /admin/comptes/" + id + "/reactiver")
                .utilisateur(admin.getEmail())
                .membreId(id)
                .date(LocalDateTime.now())
                .details("Compte de " + membre.getPrenom() + " " + membre.getNom()
                        + " réactivé par " + admin.getEmail())
                .build());

        return ResponseEntity.ok(membre);
    }

    /** Changer le statut membre (ex: réactiver un ANCIEN → PERMANENT) */
    @PutMapping("/{id}/statut")
    public ResponseEntity<Membre> changerStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal admin) {

        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));

        StatutMembre nouveauStatut;
        try {
            nouveauStatut = StatutMembre.valueOf(body.get("statut").toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        StatutMembre ancienStatut = membre.getStatut();
        membre.setStatut(nouveauStatut);
        // Si on réactive un ANCIEN, on remet active=true
        if (ancienStatut == StatutMembre.ANCIEN && nouveauStatut != StatutMembre.ANCIEN) {
            membre.setActive(true);
            membre.setDateDesactivation(null);
        }
        membreRepository.save(membre);

        auditLogRepository.save(AuditLog.builder()
                .entite("Membre").action("CHANGEMENT_STATUT")
                .methode("PUT /admin/comptes/" + id + "/statut")
                .utilisateur(admin.getEmail()).membreId(id)
                .date(LocalDateTime.now())
                .details("Statut de " + membre.getPrenom() + " " + membre.getNom()
                        + " changé de " + ancienStatut + " vers " + nouveauStatut)
                .build());

        return ResponseEntity.ok(membre);
    }

    private static final List<String> ACTIONS_COMPTE = List.of(
            "DESACTIVATION_COMPTE", "REACTIVATION_COMPTE", "CHANGEMENT_STATUT", "CHANGEMENT_ROLE");

    /** Historique complet des actions sur les comptes */
    @GetMapping("/historique")
    public ResponseEntity<List<AuditLog>> getHistoriqueComptes() {
        return ResponseEntity.ok(auditLogRepository.findByActionInOrderByDateDesc(ACTIONS_COMPTE));
    }

    /** Historique des actions sur un compte spécifique */
    @GetMapping("/{id}/historique")
    public ResponseEntity<List<AuditLog>> getHistoriqueMembre(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogRepository.findByMembreIdOrderByDateDesc(id));
    }

    /** Changer le rôle système d'un membre */
    @PutMapping("/{id}/role")
    public ResponseEntity<Membre> changerRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal admin) {

        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", id));

        String roleCode = body.get("role");
        RoleSysteme nouveauRole;
        try {
            nouveauRole = RoleSysteme.valueOf(roleCode.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        RoleSysteme ancienRole = membre.getSystemRole();
        membre.setSystemRole(nouveauRole);
        membreRepository.save(membre);

        auditLogRepository.save(AuditLog.builder()
                .entite("Membre")
                .action("CHANGEMENT_ROLE")
                .methode("PUT /admin/comptes/" + id + "/role")
                .utilisateur(admin.getEmail())
                .membreId(id)
                .date(LocalDateTime.now())
                .details("Rôle de " + membre.getPrenom() + " " + membre.getNom()
                        + " changé de " + ancienRole + " vers " + nouveauRole
                        + " par " + admin.getEmail())
                .build());

        return ResponseEntity.ok(membre);
    }
}
