package com.lias.repository;

import com.lias.entity.DemandeParticipation;
import com.lias.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeParticipationRepository extends JpaRepository<DemandeParticipation, Long> {
    List<DemandeParticipation> findByMembreId(Long membreId);
    List<DemandeParticipation> findByEvenementId(Long evenementId);
    List<DemandeParticipation> findByStatut(StatutDemande statut);
    Optional<DemandeParticipation> findByMembreIdAndEvenementId(Long membreId, Long evenementId);
}
