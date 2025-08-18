package com.bmessi.pickupsportsapp.media;

import org.springframework.web.multipart.MultipartFile;

public interface AvatarStorageService {
    // Stores the avatar and returns a public URL to access it
    String store(String username, MultipartFile file);

    // Deletes a previously stored avatar by its public URL (no-op if null/blank/non-local)
    void delete(String publicUrl);
}