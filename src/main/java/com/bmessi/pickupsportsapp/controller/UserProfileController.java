package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.UpdateUserProfileRequest;
import com.bmessi.pickupsportsapp.dto.UserProfileDTO;
import com.bmessi.pickupsportsapp.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Value("${app.http.allow-unsafe-write:false}")
    private boolean allowUnsafeWrite;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> getMyProfile(Principal principal) {
        var dto = userProfileService.getProfileByUsername(principal.getName());
        String etag = computeEtag(dto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> updateMyProfile(@Valid @RequestBody UpdateUserProfileRequest request,
                                                          @RequestHeader(value = "If-Match", required = false) String ifMatch,
                                                          @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
                                                          Principal principal) {
        // Pre-fetch for ETag evaluation
        var current = userProfileService.getProfileByUsername(principal.getName());
        enforcePreconditionsPresent(ifMatch, ifUnmodifiedSince);
        enforceIfMatch(ifMatch, computeEtag(current));

        var dto = userProfileService.updateProfile(principal.getName(), request);

        String etag = computeEtag(dto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        var dto = userProfileService.getProfileById(id);
        String etag = computeEtag(dto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> uploadMyAvatar(@RequestPart("file") MultipartFile file,
                                                         @RequestHeader(value = "If-Match", required = false) String ifMatch,
                                                         @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
                                                         Principal principal) {
        // Pre-fetch for ETag evaluation
        var current = userProfileService.getProfileByUsername(principal.getName());
        enforcePreconditionsPresent(ifMatch, ifUnmodifiedSince);
        enforceIfMatch(ifMatch, computeEtag(current));

        var dto = userProfileService.updateAvatar(principal.getName(), file);

        String etag = computeEtag(dto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @DeleteMapping("/me/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMyAvatar(@RequestHeader(value = "If-Match", required = false) String ifMatch,
                                               @RequestHeader(value = "If-Unmodified-Since", required = false) String ifUnmodifiedSince,
                                               Principal principal) {
        // Pre-fetch for ETag evaluation
        var current = userProfileService.getProfileByUsername(principal.getName());
        enforcePreconditionsPresent(ifMatch, ifUnmodifiedSince);
        enforceIfMatch(ifMatch, computeEtag(current));

        userProfileService.deleteAvatar(principal.getName());
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        return ResponseEntity.noContent().headers(headers).build();
    }

    // ===========================
    // Private helpers
    // ===========================
    private void enforcePreconditionsPresent(String ifMatchHeader, String ifUnmodifiedSinceHeader) {
        if (allowUnsafeWrite) return;
        boolean noIfMatch = (ifMatchHeader == null || ifMatchHeader.isBlank());
        boolean noIus = (ifUnmodifiedSinceHeader == null || ifUnmodifiedSinceHeader.isBlank());
        if (noIfMatch && noIus) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED, "Missing precondition header");
        }
    }

    private void enforceIfMatch(String ifMatchHeader, String currentEtag) {
        if (ifMatchHeader == null || ifMatchHeader.isBlank()) return;
        String norm = normalizeIfMatch(ifMatchHeader);
        String cur = normalizeIfMatch(currentEtag);
        if (!cur.equals(norm)) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "ETag mismatch; resource changed");
        }
    }

    private static String normalizeIfMatch(String raw) {
        String s = raw == null ? "" : raw.trim();
        if (s.startsWith("W/")) s = s.substring(2).trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1);
        }
        return s;
    }

    private static String computeEtag(UserProfileDTO dto) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String basis = String.valueOf(dto);
            byte[] digest = md.digest(basis.getBytes(StandardCharsets.UTF_8));
            String b64 = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
            return "W/\"" + b64 + "\"";
        } catch (Exception e) {
            // Fallback to simple hash if SHA-256 unavailable
            return "W/\"" + Integer.toHexString(String.valueOf(dto).hashCode()) + "\"";
        }
    }

    private static String httpDate(long epochMillis) {
        return java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .withZone(java.time.ZoneOffset.UTC)
                .format(java.time.Instant.ofEpochMilli(epochMillis));
    }
}