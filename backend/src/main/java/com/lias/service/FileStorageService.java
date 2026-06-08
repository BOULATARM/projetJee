package com.lias.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            Files.createDirectories(uploadPath.resolve("images"));
            Files.createDirectories(uploadPath.resolve("pdfs"));
            Files.createDirectories(uploadPath.resolve("documents"));
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'upload: " + uploadDir);
        }
    }

    public String uploadFile(MultipartFile file, String subfolder) {
        String rawName = file.getOriginalFilename();
        String originalFilename = (rawName != null && !rawName.isBlank())
                ? StringUtils.cleanPath(rawName) : "file";
        String extension = "";
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID().toString() + extension;

        try {
            Path targetDir = uploadPath.resolve(subfolder);
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(newFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return subfolder + "/" + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'upload du fichier: " + originalFilename, e);
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path fullPath = uploadPath.resolve(filePath).normalize();
            Resource resource = new UrlResource(fullPath.toUri());
            if (resource.exists()) {
                return resource;
            }
            throw new RuntimeException("Fichier non trouvé: " + filePath);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Erreur lors du chargement du fichier: " + filePath, e);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path fullPath = uploadPath.resolve(filePath).normalize();
            Files.deleteIfExists(fullPath);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier: " + filePath, e);
        }
    }
}
