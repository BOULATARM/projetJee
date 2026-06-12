package com.lias.repository;

import com.lias.entity.MaterielHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterielHistoriqueRepository extends JpaRepository<MaterielHistorique, Long> {
    List<MaterielHistorique> findByMaterielIdOrderByDateActionDesc(Long materielId);
}
