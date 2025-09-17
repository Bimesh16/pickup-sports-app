package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.UpdateUserProfileRequest;
import com.bmessi.pickupsportsapp.dto.UserProfileDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.media.AvatarStorageService;
import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final AvatarStorageService avatarStorageService;
    private final SportRepository sportRepository;

    // @Cacheable("user-profiles") // Temporarily disabled due to serialization issue
    @Transactional(readOnly = true)
    public UserProfileDTO getProfileByUsername(String username) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDto(user);
    }

    // @Cacheable("user-profiles") // Temporarily disabled due to serialization issue
    @Transactional(readOnly = true)
    public UserProfileDTO getProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDto(user);
    }

    @CacheEvict(cacheNames = "user-profiles", key = "#username")
    @Transactional
    public UserProfileDTO updateProfile(String username, UpdateUserProfileRequest request) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Basic profile fields
        if (request.bio() != null) user.setBio(request.bio().trim());
        if (request.location() != null) user.setLocation(request.location().trim());
        if (request.latitude() != null) user.setLatitude(request.latitude());
        if (request.longitude() != null) user.setLongitude(request.longitude());
        if (request.avatarUrl() != null) user.setAvatarUrl(request.avatarUrl().trim());
        if (request.skillLevel() != null) user.setSkillLevel(request.skillLevel());
        if (request.age() != null) user.setAge(request.age());
        if (request.position() != null) user.setPosition(request.position().trim());
        if (request.contactPreference() != null) user.setContactPreference(request.contactPreference().trim());

        // New profile fields
        if (request.firstName() != null) user.setFirstName(request.firstName().trim());
        if (request.lastName() != null) user.setLastName(request.lastName().trim());
        if (request.email() != null) user.setEmail(request.email().trim());
        if (request.displayName() != null) user.setDisplayName(request.displayName().trim());
        if (request.phone() != null) user.setPhone(request.phone().trim());
        if (request.gender() != null) user.setGender(request.gender());
        if (request.nationality() != null) user.setNationality(request.nationality().trim());
        if (request.xp() != null) user.setXp(request.xp());
        if (request.level() != null) user.setLevel(request.level());
        if (request.rank() != null) user.setRank(request.rank());
        if (request.preferredSports() != null) user.setPreferredSports(request.preferredSports());
        if (request.privacySettings() != null) user.setPrivacySettings(request.privacySettings());
        if (request.securitySettings() != null) user.setSecuritySettings(request.securitySettings());

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @CacheEvict(cacheNames = "user-profiles", key = "#username")
    @Transactional
    public UserProfileDTO updateAvatar(String username, MultipartFile file) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldUrl = user.getAvatarUrl();
        String newUrl = avatarStorageService.store(username, file);

        user.setAvatarUrl(newUrl);
        User saved = userRepository.save(user);

        // Best-effort cleanup
        if (oldUrl != null && !oldUrl.isBlank() && !oldUrl.equals(newUrl)) {
            avatarStorageService.delete(oldUrl);
        }
        return toDto(saved);
    }

    @CacheEvict(cacheNames = "user-profiles", key = "#username")
    @Transactional
    public void deleteAvatar(String username) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldUrl = user.getAvatarUrl();
        if (oldUrl == null || oldUrl.isBlank()) return;

        avatarStorageService.delete(oldUrl);
        user.setAvatarUrl(null);
        userRepository.save(user);
    }

    @CacheEvict(cacheNames = "user-profiles", key = "#username")
    @Transactional
    public UserProfileDTO updatePreferredSport(String username, String sportName) {
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Sport s = sportRepository.findByNameIgnoreCase(sportName.toLowerCase());
        if (s == null) throw new IllegalArgumentException("Unknown sport: " + sportName);
        user.setPreferredSport(s);
        User saved = userRepository.save(user);
        return toDto(saved);
    }

    private static UserProfileDTO toDto(User u) {
        return new UserProfileDTO(
                u.getId(),
                u.getUsername(),
                u.getFirstName(),
                u.getLastName(),
                u.getEmail(),
                u.getDisplayName(),
                u.getBio(),
                u.getAvatarUrl(),
                u.getLocation(),
                u.getLatitude(),
                u.getLongitude(),
                u.getSkillLevel(),
                u.getAge(),
                u.getPosition(),
                u.getContactPreference(),
                u.getPhone(),
                u.getGender(),
                u.getNationality(),
                u.getXp(),
                u.getLevel(),
                u.getRank(),
                u.getIsEmailVerified(),
                u.getIsPhoneVerified(),
                u.getPreferredSports(),
                u.getPrivacySettings(),
                u.getSecuritySettings()
        );
    }
}
