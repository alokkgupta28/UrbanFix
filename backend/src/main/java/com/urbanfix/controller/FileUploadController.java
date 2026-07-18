package com.urbanfix.controller;

import com.urbanfix.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final StorageService storageService;
    private static final Set<String> ALLOWED_TYPES = Set.of("profiles", "providers", "services");

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "profiles") String type) {
        
        if (!ALLOWED_TYPES.contains(type)) {
            type = "profiles";
        }
        
        String url = storageService.store(file, type);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
