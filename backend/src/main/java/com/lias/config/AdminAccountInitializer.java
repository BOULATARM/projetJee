package com.lias.config;

import com.lias.entity.Membre;
import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutMembre;
import com.lias.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Crée le compte admin@lias.com / lias123 si il n'existe pas déjà.
 * S'exécute après DataInitializer (Order 2).
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class AdminAccountInitializer implements CommandLineRunner {

    private final MembreRepository membreRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminIfAbsent("admin@admin.com", "admin123", "Admin");
        createAdminIfAbsent("admin@lias.com", "lias123", "LIAS");
    }

    private void createAdminIfAbsent(String email, String password, String nom) {
        if (membreRepository.findByEmail(email).isPresent()) {
            log.info("Compte {} déjà existant — ignoré", email);
            return;
        }

        Membre admin = Membre.builder()
                .nom(nom)
                .prenom("Admin")
                .email(email)
                .motDePasse(passwordEncoder.encode(password))
                .statut(StatutMembre.PERMANENT)
                .active(true)
                .systemRole(RoleSysteme.ADMIN)
                .dateEmbauche(LocalDate.now())
                .biographie("Compte administrateur principal")
                .build();

        membreRepository.save(admin);
        log.info("✅ Compte admin créé : {}", email);
    }
}
