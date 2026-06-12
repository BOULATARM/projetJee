package com.lias.repository;

import com.lias.entity.ProcesVerbal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcesVerbalRepository extends JpaRepository<ProcesVerbal, Long> {
    List<ProcesVerbal> findByReunionIdOrderByDateDesc(Long reunionId);
    List<ProcesVerbal> findAllByOrderByDateDesc();
}
