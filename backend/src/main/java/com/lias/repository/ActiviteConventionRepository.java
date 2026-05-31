package com.lias.repository;

import com.lias.entity.ActiviteConvention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActiviteConventionRepository extends JpaRepository<ActiviteConvention, Long> {
}
