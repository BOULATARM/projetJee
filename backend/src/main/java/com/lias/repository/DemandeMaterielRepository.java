package com.lias.repository;

import com.lias.entity.DemandeMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DemandeMaterielRepository extends JpaRepository<DemandeMateriel, Long> {
    List<DemandeMateriel> findByMembreId(Long membreId);
}
