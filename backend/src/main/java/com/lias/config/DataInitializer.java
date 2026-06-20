package com.lias.config;

import com.lias.entity.*;
import com.lias.enums.*;
import com.lias.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final LaboratoireRepository laboratoireRepository;
    private final MembreRepository membreRepository;
    private final EquipeRepository equipeRepository;
    private final MandatRepository mandatRepository;
    private final PublicationRepository publicationRepository;
    private final EvenementRepository evenementRepository;
    private final AffiliationMembreRepository affiliationRepository;
    private final RoleMembreRepository roleMembreRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (membreRepository.count() > 0) {
            log.info("Données déjà initialisées");
            return;
        }

        log.info("Initialisation des données...");

        Laboratoire lias = Laboratoire.builder()
                .nom("Laboratoire d'Informatique et d'Applications Scientifiques")
                .acronyme("LIAS")
                .description("Laboratoire de recherche en informatique de la Faculté des Sciences Ben M'Sik")
                .dateCreation(LocalDate.of(2010, 9, 1))
                .adresse("Faculté des Sciences Ben M'Sik, Casablanca, Maroc")
                .axesDeRecherche("Intelligence Artificielle, Réseaux et Systèmes Distribués, Big Data et Gestion des Connaissances")
                .build();
        lias = laboratoireRepository.save(lias);

        Membre admin = Membre.builder()
                .nom("Admin").prenom("Systeme").email("admin@lias.ma")
                .motDePasse(passwordEncoder.encode("admin123"))
                .statut(StatutMembre.PERMANENT).active(true).systemRole(RoleSysteme.ADMIN)
                .dateEmbauche(LocalDate.of(2010, 9, 1)).biographie("Administrateur du système")
                .build();

        Membre directeur = Membre.builder()
                .nom("Benali").prenom("Mohamed").email("directeur@lias.ma")
                .motDePasse(passwordEncoder.encode("directeur123"))
                .statut(StatutMembre.PERMANENT).active(true).systemRole(RoleSysteme.DIRECTEUR)
                .dateEmbauche(LocalDate.of(2012, 1, 15))
                .biographie("Directeur du laboratoire LIAS").etablissementOrigine("Faculté des Sciences Ben M'Sik")
                .build();

        Membre chefIA = Membre.builder()
                .nom("El Alami").prenom("Fatima").email("f.elalami@lias.ma")
                .motDePasse(passwordEncoder.encode("password123"))
                .statut(StatutMembre.PERMANENT).active(true).systemRole(RoleSysteme.CHEF_EQUIPE)
                .dateEmbauche(LocalDate.of(2013, 3, 10)).etablissementOrigine("Faculté des Sciences Ben M'Sik")
                .build();

        Membre chefReseaux = Membre.builder()
                .nom("Idrissi").prenom("Hassan").email("h.idrissi@lias.ma")
                .motDePasse(passwordEncoder.encode("password123"))
                .statut(StatutMembre.PERMANENT).active(true).systemRole(RoleSysteme.CHEF_EQUIPE)
                .dateEmbauche(LocalDate.of(2014, 6, 20)).etablissementOrigine("Université Hassan II")
                .build();

        Membre membre1 = Membre.builder()
                .nom("Ouazzani").prenom("Nadia").email("n.ouazzani@lias.ma")
                .motDePasse(passwordEncoder.encode("password123"))
                .statut(StatutMembre.PERMANENT).active(true).systemRole(RoleSysteme.MEMBRE)
                .dateEmbauche(LocalDate.of(2015, 9, 5)).etablissementOrigine("Faculté des Sciences Ben M'Sik")
                .build();

        Membre membre2 = Membre.builder()
                .nom("Tazi").prenom("Karim").email("k.tazi@lias.ma")
                .motDePasse(passwordEncoder.encode("password123"))
                .statut(StatutMembre.ASSOCIE).active(true).systemRole(RoleSysteme.MEMBRE)
                .dateEmbauche(LocalDate.of(2016, 2, 14)).etablissementOrigine("Université Mohammed V")
                .build();

        Membre doctorant1 = Membre.builder()
                .nom("Bennani").prenom("Sara").email("s.bennani@lias.ma")
                .motDePasse(passwordEncoder.encode("password123"))
                .statut(StatutMembre.DOCTORANT).active(true).systemRole(RoleSysteme.MEMBRE)
                .dateEmbauche(LocalDate.of(2023, 10, 1))
                .build();

        Membre doctorant2 = Membre.builder()
                .nom("Fassi").prenom("Youssef").email("y.fassi@lias.ma")
                .motDePasse(passwordEncoder.encode("password123"))
                .statut(StatutMembre.DOCTORANT).active(true).systemRole(RoleSysteme.MEMBRE)
                .dateEmbauche(LocalDate.of(2024, 1, 15))
                .build();

        List<Membre> membres = membreRepository.saveAll(List.of(
                admin, directeur, chefIA, chefReseaux, membre1, membre2, doctorant1, doctorant2));

        Equipe equipeIA = Equipe.builder()
                .nom("Équipe Intelligence Artificielle").laboratoire(lias)
                .description("Recherche en IA, Machine Learning et Deep Learning")
                .axeRecherche("IA, ML, NLP, Vision").chefEquipe(chefIA)
                .build();

        Equipe equipeReseaux = Equipe.builder()
                .nom("Équipe Réseaux et Systèmes Distribués").laboratoire(lias)
                .description("Recherche en réseaux, IoT et systèmes distribués")
                .axeRecherche("Réseaux, IoT, Cloud").chefEquipe(chefReseaux)
                .build();

        Equipe equipeDonnees = Equipe.builder()
                .nom("Équipe Données et Connaissances").laboratoire(lias)
                .description("Recherche en Big Data, Data Mining et Web Sémantique")
                .axeRecherche("Big Data, Data Mining, Web Sémantique")
                .build();

        List<Equipe> equipes = equipeRepository.saveAll(List.of(equipeIA, equipeReseaux, equipeDonnees));

        affiliationRepository.saveAll(List.of(
                AffiliationMembre.builder().membre(chefIA).equipe(equipeIA).dateDebut(LocalDate.of(2013, 3, 10)).actif(true).build(),
                AffiliationMembre.builder().membre(chefReseaux).equipe(equipeReseaux).dateDebut(LocalDate.of(2014, 6, 20)).actif(true).build(),
                AffiliationMembre.builder().membre(membre1).equipe(equipeIA).dateDebut(LocalDate.of(2015, 9, 5)).actif(true).build(),
                AffiliationMembre.builder().membre(membre2).equipe(equipeDonnees).dateDebut(LocalDate.of(2016, 2, 14)).actif(true).build(),
                AffiliationMembre.builder().membre(doctorant1).equipe(equipeIA).dateDebut(LocalDate.of(2023, 10, 1)).actif(true).build(),
                AffiliationMembre.builder().membre(doctorant2).equipe(equipeReseaux).dateDebut(LocalDate.of(2024, 1, 15)).actif(true).build()
        ));

        Mandat mandat = Mandat.builder()
                .laboratoire(lias).directeur(directeur).viceDirecteur(chefIA)
                .dateDebut(LocalDate.of(2024, 1, 1)).actif(true)
                .build();
        mandatRepository.save(mandat);

        Publication pub1 = Publication.builder()
                .titre("Deep Learning Approaches for Natural Language Processing: A Comprehensive Survey")
                .resume("Cet article présente une revue complète des approches de deep learning pour le NLP.")
                .annee(2024).doi("10.1234/lias.2024.001")
                .typePub(TypePublication.ARTICLE).equipe(equipeIA)
                .dateAjout(LocalDateTime.now()).build();

        Publication pub2 = Publication.builder()
                .titre("IoT Security: Challenges and Solutions")
                .resume("Analyse des défis de sécurité dans l'IoT et propositions de solutions.")
                .annee(2024).doi("10.1234/lias.2024.002")
                .typePub(TypePublication.CONFERENCE).equipe(equipeReseaux)
                .dateAjout(LocalDateTime.now()).build();

        Publication pub3 = Publication.builder()
                .titre("Big Data Analytics for Smart Cities")
                .resume("Utilisation du Big Data pour les villes intelligentes.")
                .annee(2023).doi("10.1234/lias.2023.003")
                .typePub(TypePublication.ARTICLE).equipe(equipeDonnees)
                .dateAjout(LocalDateTime.now()).build();

        publicationRepository.saveAll(List.of(pub1, pub2, pub3));

        Evenement evt1 = Evenement.builder()
                .titre("Conférence Internationale sur l'IA 2025")
                .description("Conférence annuelle du laboratoire sur l'intelligence artificielle")
                .type(TypeEvenement.CONFERENCE).lieu("Faculté des Sciences Ben M'Sik")
                .dateDebut(LocalDateTime.of(2025, 5, 15, 9, 0))
                .dateFin(LocalDateTime.of(2025, 5, 17, 18, 0))
                .laboratoire(lias).edition(1).annee(2025)
                .statut(StatutEvenement.PLANIFIE).build();

        Evenement evt2 = Evenement.builder()
                .titre("Séminaire: Sécurité des Réseaux")
                .description("Séminaire sur les dernières avancées en sécurité des réseaux")
                .type(TypeEvenement.SEMINAIRE).lieu("Salle de conférence LIAS")
                .dateDebut(LocalDateTime.of(2025, 3, 10, 10, 0))
                .dateFin(LocalDateTime.of(2025, 3, 10, 16, 0))
                .laboratoire(lias).annee(2025)
                .statut(StatutEvenement.TERMINE).build();

        evenementRepository.saveAll(List.of(evt1, evt2));

        log.info("Données initialisées avec succès!");
    }
}
