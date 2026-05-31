package com.lias.repository;

import com.lias.entity.ParticipantReunion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantReunionRepository extends JpaRepository<ParticipantReunion, Long> {
}
