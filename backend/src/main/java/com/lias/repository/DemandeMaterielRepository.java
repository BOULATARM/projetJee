package com.lias.repository;

import com.lias.entity.DemandeMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DemandeMaterielRepository extends JpaRepository<DemandeMateriel, Long> {
    List<DemandeMateriel> findByMembreId(Long membreId);

    @Query("""
        SELECT d FROM DemandeMateriel d
        WHERE d.materielDemande.id = :materielId
          AND d.statut = 'ACCEPTEE'
          AND d.id <> :excludeId
          AND d.datePriseSouhaitee IS NOT NULL
          AND d.dateRetourPrevue IS NOT NULL
          AND d.datePriseSouhaitee <= :dateFin
          AND d.dateRetourPrevue >= :dateDebut
        """)
    List<DemandeMateriel> findConflicts(
        @Param("materielId") Long materielId,
        @Param("dateDebut") LocalDate dateDebut,
        @Param("dateFin") LocalDate dateFin,
        @Param("excludeId") Long excludeId
    );
}
