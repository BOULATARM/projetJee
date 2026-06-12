package com.lias.repository;

import com.lias.entity.DemandeDocument;
import com.lias.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DemandeDocumentRepository extends JpaRepository<DemandeDocument, Long> {
    List<DemandeDocument> findAllByOrderByDateCreationDesc();
    List<DemandeDocument> findByStatutOrderByDateCreationDesc(StatutDemande statut);
    List<DemandeDocument> findByDemandeurIdOrderByDateCreationDesc(Long demandeurId);
}
