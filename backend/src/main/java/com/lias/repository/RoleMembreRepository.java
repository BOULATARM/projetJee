package com.lias.repository;

import com.lias.entity.RoleMembre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleMembreRepository extends JpaRepository<RoleMembre, Long> {
}
