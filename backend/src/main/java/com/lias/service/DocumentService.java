package com.lias.service;

import com.lias.dto.request.DocumentRequestDTO;
import com.lias.entity.Document;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentService {
    Document uploadDocument(MultipartFile file, DocumentRequestDTO dto, Long membreId);
    List<Document> getAllDocuments();
    List<Document> getDocumentsByEvenement(Long evenementId);
    List<Document> getDocumentsByReunion(Long reunionId);
    List<Document> getDocumentsByConvention(Long conventionId);
    Resource downloadDocument(Long documentId);
    void deleteDocument(Long documentId);
}
