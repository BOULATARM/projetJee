package com.lias.repository;

import com.lias.entity.Evenement;
import com.lias.enums.TypeEvenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Long> {
    List<Evenement> findByAnnee(Integer annee);
    List<Evenement> findByType(TypeEvenement type);
    List<Evenement> findByDateDebutBetween(LocalDateTime start, LocalDateTime end);
}
