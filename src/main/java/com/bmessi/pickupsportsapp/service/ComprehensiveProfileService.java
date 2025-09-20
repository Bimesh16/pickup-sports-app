package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.ComprehensiveProfileDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for managing comprehensive user profiles.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComprehensiveProfileService {

    private final UserRepository userRepository;

    /**
     * Get comprehensive profile data for a user.
     */
    @Transactional(readOnly = true)
    public Optional<ComprehensiveProfileDTO> getComprehensiveProfile(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return Optional.empty();
            }

            User user = userOpt.get();

            ComprehensiveProfileDTO profile = ComprehensiveProfileDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .phoneNumber(user.getPhone())
                    .profilePictureUrl(user.getAvatarUrl())
                    .bio(user.getBio())
                    .location(user.getLocation())
                    .createdAt(user.getCreatedAt())
                    .isActive(true)
                    .isVerified(user.isVerified())
                    .build();

            return Optional.of(profile);
        } catch (Exception e) {
            log.error("Error getting comprehensive profile for user {}", userId, e);
            return Optional.empty();
        }
    }

    /**
     * Get comprehensive profile data for a user by username.
     */
    @Transactional(readOnly = true)
    public ComprehensiveProfileDTO getComprehensiveProfile(String username) {
        try {
            Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(username);
            if (userOpt.isEmpty()) {
                return null;
            }

            User user = userOpt.get();

            ComprehensiveProfileDTO profile = ComprehensiveProfileDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .phoneNumber(user.getPhone())
                    .profilePictureUrl(user.getAvatarUrl())
                    .bio(user.getBio())
                    .location(user.getLocation())
                    .createdAt(user.getCreatedAt())
                    .isActive(true)
                    .isVerified(user.isVerified())
                    .build();

            return profile;
        } catch (Exception e) {
            log.error("Error getting comprehensive profile for username {}", username, e);
            return null;
        }
    }

    /**
     * Get comprehensive profile data for a user by username (Optional version).
     */
    @Transactional(readOnly = true)
    public Optional<ComprehensiveProfileDTO> getComprehensiveProfileByUsername(String username) {
        try {
            ComprehensiveProfileDTO profile = getComprehensiveProfile(username);
            return Optional.ofNullable(profile);
        } catch (Exception e) {
            log.error("Error getting comprehensive profile for username {}", username, e);
            return Optional.empty();
        }
    }
}
