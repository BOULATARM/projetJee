package com.lias.repository;

import com.lias.entity.EquipeHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipeHistoriqueRepository extends JpaRepository<EquipeHistorique, Long> {
    List<EquipeHistorique> findByEquipeIdOrderByDateDesc(Long equipeId);
    void deleteByEquipeId(Long equipeId);
}
