package com.lias.repository;

import com.lias.entity.RapportAnnuel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RapportAnnuelRepository extends JpaRepository<RapportAnnuel, Long> {
}
