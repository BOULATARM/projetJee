package com.lias.repository;

import com.lias.entity.DistributionMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DistributionMaterielRepository extends JpaRepository<DistributionMateriel, Long> {
    List<DistributionMateriel> findByMaterielId(Long materielId);

    @Query("SELECT DISTINCT d.membre FROM DistributionMateriel d WHERE d.materiel.id = ?1")
    List<com.lias.entity.Membre> findMembresAyantRecu(Long materielId);
}
