package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.UpdateUserProfileRequest;
import com.bmessi.pickupsportsapp.dto.UserProfileDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.media.AvatarStorageService;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final AvatarStorageService avatarStorageService;

    @Transactional(readOnly = true)
    public UserProfileDTO getProfileByUsername(String username) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDto(user);
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDto(user);
    }

    @Transactional
    public UserProfileDTO updateProfile(String username, UpdateUserProfileRequest request) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.bio() != null) user.setBio(request.bio().trim());
        if (request.avatarUrl() != null) user.setAvatarUrl(request.avatarUrl().trim());
        if (request.skillLevel() != null) user.setSkillLevel(request.skillLevel());

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Transactional
    public UserProfileDTO updateAvatar(String username, MultipartFile file) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldUrl = user.getAvatarUrl();
        String newUrl = avatarStorageService.store(username, file);

        user.setAvatarUrl(newUrl);
        User saved = userRepository.save(user);

        // Best-effort cleanup; do not block on deletion errors
        if (oldUrl != null && !oldUrl.isBlank() && !oldUrl.equals(newUrl)) {
            avatarStorageService.delete(oldUrl);
        }

        return toDto(saved);
    }

    @Transactional
    public void deleteAvatar(String username) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldUrl = user.getAvatarUrl();
        if (oldUrl == null || oldUrl.isBlank()) return;

        // Best-effort deletion first
        avatarStorageService.delete(oldUrl);

        // Detach avatar from user
        user.setAvatarUrl(null);
        userRepository.save(user);
    }

    private static UserProfileDTO toDto(User u) {
        return new UserProfileDTO(
                u.getId(),
                u.getUsername(),
                u.getBio(),
                u.getAvatarUrl(),
                u.getSkillLevel()
        );
    }
}