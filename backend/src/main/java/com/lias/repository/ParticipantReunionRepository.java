package com.lias.repository;

import com.lias.entity.ParticipantReunion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParticipantReunionRepository extends JpaRepository<ParticipantReunion, Long> {
    List<ParticipantReunion> findByReunionId(Long reunionId);
    boolean existsByReunionIdAndMembreId(Long reunionId, Long membreId);
    void deleteByReunionIdAndMembreId(Long reunionId, Long membreId);
}
