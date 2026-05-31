package com.lias.repository;

import com.lias.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByDateDesc(Pageable pageable);
    List<AuditLog> findByEntiteOrderByDateDesc(String entite);
    List<AuditLog> findByUtilisateurOrderByDateDesc(String utilisateur);
    List<AuditLog> findByActionOrderByDateDesc(String action);
    List<AuditLog> findByDateBetweenOrderByDateDesc(LocalDateTime from, LocalDateTime to);
    Page<AuditLog> findByEntiteContainingIgnoreCaseOrUtilisateurContainingIgnoreCaseOrderByDateDesc(
            String entite, String utilisateur, Pageable pageable);
}
