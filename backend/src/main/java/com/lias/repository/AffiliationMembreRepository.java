package com.lias.repository;

import com.lias.entity.AffiliationMembre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AffiliationMembreRepository extends JpaRepository<AffiliationMembre, Long> {
    Optional<AffiliationMembre> findByMembreIdAndActifTrue(Long membreId);
    List<AffiliationMembre> findByEquipeId(Long equipeId);
    List<AffiliationMembre> findByEquipeIdAndActifTrue(Long equipeId);
    List<AffiliationMembre> findByMembreIdOrderByDateDebutDesc(Long membreId);
    void deleteByEquipeId(Long equipeId);
}
