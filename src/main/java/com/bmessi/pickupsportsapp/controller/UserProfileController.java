package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.UpdateUserProfileRequest;
import com.bmessi.pickupsportsapp.dto.UserProfileDTO;
import com.bmessi.pickupsportsapp.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> getMyProfile(Principal principal) {
        var dto = userProfileService.getProfileByUsername(principal.getName());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> updateMyProfile(@Valid @RequestBody UpdateUserProfileRequest request,
                                                          Principal principal) {
        var dto = userProfileService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        var dto = userProfileService.getProfileById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> uploadMyAvatar(@RequestPart("file") MultipartFile file,
                                                         Principal principal) {
        var dto = userProfileService.updateAvatar(principal.getName(), file);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/me/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMyAvatar(Principal principal) {
        userProfileService.deleteAvatar(principal.getName());
        return ResponseEntity.noContent().build();
    }
}