package com.urbanfix.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    
    /**
     * Stores a file and returns its public URL/path.
     * @param file the uploaded file
     * @param subDir subdirectory (e.g., "profiles", "providers")
     * @return public access URL/path
     */
    String store(MultipartFile file, String subDir);
    
    /**
     * Deletes a stored file.
     * @param path the public access URL/path returned by store()
     */
    void delete(String path);
}
