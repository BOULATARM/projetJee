package com.lias.repository;

import com.lias.entity.Membre;
import com.lias.enums.StatutMembre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembreRepository extends JpaRepository<Membre, Long> {
    Optional<Membre> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Membre> findByStatut(StatutMembre statut);
    List<Membre> findByActiveTrue();
    long countByStatut(StatutMembre statut);
    long count();
    List<Membre> findByNomContainingOrPrenomContaining(String nom, String prenom);

    @Query("SELECT m FROM Membre m WHERE m.id NOT IN (SELECT a.membre.id FROM AffiliationMembre a WHERE a.actif = true)")
    List<Membre> findMembresWithoutEquipe();
}
