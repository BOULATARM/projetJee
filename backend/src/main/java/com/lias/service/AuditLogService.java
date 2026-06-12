package com.lias.service;

import com.lias.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditLogService {
    void log(String entite, String action, String methode, String utilisateur, Long membreId, String details);
    Page<AuditLog> getAll(Pageable pageable);
    Page<AuditLog> search(String q, Pageable pageable);
    List<AuditLog> getByEntite(String entite);
    List<AuditLog> getByUtilisateur(String utilisateur);
    List<AuditLog> getByMembreId(Long membreId);
}
