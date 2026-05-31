package com.lias.repository;

import com.lias.entity.Mandat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MandatRepository extends JpaRepository<Mandat, Long> {
    Optional<Mandat> findByActifTrue();
    Optional<Mandat> findTopByOrderByDateDebutDesc();
}
