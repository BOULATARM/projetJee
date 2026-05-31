package com.lias.repository;

import com.lias.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByEvenementId(Long evenementId);
    List<Document> findByReunionId(Long reunionId);
    List<Document> findByConventionId(Long conventionId);
    List<Document> findByNomContainingIgnoreCase(String nom);
}
