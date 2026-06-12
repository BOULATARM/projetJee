package com.lias.service.impl;

import com.lias.entity.AuditLog;
import com.lias.repository.AuditLogRepository;
import com.lias.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entite, String action, String methode,
                    String utilisateur, Long membreId, String details) {
        AuditLog log = AuditLog.builder()
                .entite(entite)
                .action(action)
                .methode(methode)
                .utilisateur(utilisateur)
                .membreId(membreId)
                .date(LocalDateTime.now())
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    @Override
    public Page<AuditLog> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByDateDesc(pageable);
    }

    @Override
    public Page<AuditLog> search(String q, Pageable pageable) {
        return auditLogRepository
                .findByEntiteContainingIgnoreCaseOrUtilisateurContainingIgnoreCaseOrderByDateDesc(
                        q, q, pageable);
    }

    @Override
    public List<AuditLog> getByEntite(String entite) {
        return auditLogRepository.findByEntiteOrderByDateDesc(entite);
    }

    @Override
    public List<AuditLog> getByUtilisateur(String utilisateur) {
        return auditLogRepository.findByUtilisateurOrderByDateDesc(utilisateur);
    }

    @Override
    public List<AuditLog> getByMembreId(Long membreId) {
        return auditLogRepository.findByMembreIdOrderByDateDesc(membreId);
    }
}
