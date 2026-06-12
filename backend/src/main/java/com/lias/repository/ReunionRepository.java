package com.lias.repository;

import com.lias.entity.Reunion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReunionRepository extends JpaRepository<Reunion, Long> {
    @Query("SELECT r FROM Reunion r WHERE YEAR(r.dateReunion) = :annee")
    List<Reunion> findByAnnee(int annee);
}
