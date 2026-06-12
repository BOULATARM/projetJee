package com.lias.repository;

import com.lias.entity.ParticipationEvenement;
import com.lias.enums.StatutParticipation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipationEvenementRepository extends JpaRepository<ParticipationEvenement, Long> {
    List<ParticipationEvenement> findByEvenementId(Long evenementId);
    Optional<ParticipationEvenement> findByEvenementIdAndMembreId(Long evenementId, Long membreId);
    boolean existsByEvenementIdAndMembreId(Long evenementId, Long membreId);
    List<ParticipationEvenement> findByEvenementIdAndStatut(Long evenementId, StatutParticipation statut);
}
