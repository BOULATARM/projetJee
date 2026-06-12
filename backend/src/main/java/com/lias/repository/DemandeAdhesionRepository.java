package com.lias.repository;

import com.lias.entity.DemandeAdhesion;
import com.lias.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion, Long> {
    List<DemandeAdhesion> findByStatut(StatutDemande statut);
    Optional<DemandeAdhesion> findTopByEmailOrderByDateDepotDesc(String email);
}
