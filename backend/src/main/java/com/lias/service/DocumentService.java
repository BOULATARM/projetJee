package com.lias.service;

import com.lias.dto.request.DocumentRequestDTO;
import com.lias.entity.Document;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentService {
    Document uploadDocument(MultipartFile file, DocumentRequestDTO dto, Long membreId, boolean isPrivileged);
    List<Document> getAllDocuments();
    List<Document> getDocumentsPending();
    List<Document> getHistoriqueDecisions();
    List<Document> getMesDocuments(Long membreId);
    Document approuverDocument(Long documentId, Long directeurId);
    Document rejeterDocument(Long documentId, String motifRefus, Long directeurId);
    List<Document> getDocumentsByEvenement(Long evenementId);
    List<Document> getDocumentsByReunion(Long reunionId);
    List<Document> getDocumentsByConvention(Long conventionId);
    Resource downloadDocument(Long documentId);
    void deleteDocument(Long documentId);
}
