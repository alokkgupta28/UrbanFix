package com.urbanfix.service;

import com.urbanfix.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation.resolve("profiles"));
            Files.createDirectories(rootLocation.resolve("providers"));
            Files.createDirectories(rootLocation.resolve("services"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directories", e);
        }
    }

    @Override
    public String store(MultipartFile file, String subDir) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String extension = "";
        
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Generate unique filename
        String filename = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.rootLocation.resolve(subDir).resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Return the public URL path
            return "/uploads/" + subDir + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    @Override
    public void delete(String path) {
        if (path == null || !path.startsWith("/uploads/")) {
            return;
        }
        
        try {
            // path is like /uploads/profiles/123.jpg
            String relativePath = path.substring("/uploads/".length());
            Path targetLocation = this.rootLocation.resolve(relativePath);
            Files.deleteIfExists(targetLocation);
        } catch (IOException e) {
            // log error but don't fail transaction
            System.err.println("Could not delete file: " + path);
        }
    }
}
