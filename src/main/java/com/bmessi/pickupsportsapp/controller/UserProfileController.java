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
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

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

    @Value("${media.avatar.include-thumbnail-header:false}")
    private boolean includeThumbnailHeader;

    @Value("${media.avatar.max-bytes:2097152}") // default 2MB
    private long avatarMaxBytes;

    @Value("${media.avatar.allowed-types:image/png,image/jpeg,image/webp}")
    private String avatarAllowedTypesCsv;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> getMyProfile(Principal principal) {
        var dto = userProfileService.getProfileByUsername(principal.getName());
        String etag = computeEtag(dto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        if (includeThumbnailHeader) {
            String thumb = deriveThumbUrl(dto.avatarUrl());
            if (thumb != null) headers.add("X-Avatar-Thumbnail-Url", thumb);
        }
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @org.springframework.cache.annotation.CacheEvict(cacheNames = "profile", key = "#principal.name")
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

    @org.springframework.cache.annotation.Cacheable(cacheNames = "profile", key = "#id")
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        var dto = userProfileService.getProfileById(id);
        String etag = computeEtag(dto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        if (includeThumbnailHeader) {
            String thumb = deriveThumbUrl(dto.avatarUrl());
            if (thumb != null) headers.add("X-Avatar-Thumbnail-Url", thumb);
        }
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @Value("${media.avatar.absolute-max-width:8000}")
    private int avatarAbsoluteMaxWidth;

    @Value("${media.avatar.absolute-max-height:8000}")
    private int avatarAbsoluteMaxHeight;

    @org.springframework.cache.annotation.CacheEvict(cacheNames = "profile", key = "#principal.name")
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

        // Basic validation
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar file is required");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();

        // Allowed types from config (comma-separated)
        java.util.Set<String> allowed = java.util.Arrays.stream(avatarAllowedTypesCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(String::toLowerCase)
                .collect(java.util.stream.Collectors.toSet());

        boolean typeOk = allowed.stream().anyMatch(contentType::equals);
        if (!typeOk) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Allowed avatar types: " + String.join(", ", allowed));
        }
        if (file.getSize() > avatarMaxBytes) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "Avatar exceeds " + avatarMaxBytes + " bytes limit");
        }
        // Basic magic-number sniffing
        try (var is = file.getInputStream()) {
            byte[] header = is.readNBytes(12);
            if (!looksLikePng(header) && !looksLikeJpeg(header) && !looksLikeWebp(header)) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Invalid image signature");
            }
        } catch (java.io.IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded file");
        }
        // Absolute dimension hard cap (avoid decoding huge images)
        try (var is = file.getInputStream()) {
            javax.imageio.ImageIO.setUseCache(false);
            java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(is);
            if (img == null) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported image format");
            }
            if (img.getWidth() > avatarAbsoluteMaxWidth || img.getHeight() > avatarAbsoluteMaxHeight) {
                throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                        "Avatar dimensions exceed " + avatarAbsoluteMaxWidth + "x" + avatarAbsoluteMaxHeight);
            }
        } catch (java.io.IOException io) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded file");
        }

        var dto = userProfileService.updateAvatar(principal.getName(), file);

        String etag = computeEtag(dto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.CACHE_CONTROL, "private, max-age=30");
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
        if (includeThumbnailHeader) {
            String thumb = deriveThumbUrl(dto.avatarUrl());
            if (thumb != null) headers.add("X-Avatar-Thumbnail-Url", thumb);
        }
        return ResponseEntity.ok().headers(headers).body(dto);
    }

    @org.springframework.cache.annotation.CacheEvict(cacheNames = "profile", key = "#principal.name")
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

        @GetMapping("/me/avatar/thumbnail")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<java.util.Map<String, Object>> getMyAvatarThumbnail(Principal principal) {
            var dto = userProfileService.getProfileByUsername(principal.getName());
            String thumb = deriveThumbUrl(dto.avatarUrl());
            if (thumb == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                        .headers(noStore())
                        .body(java.util.Map.of("error", "not_found", "message", "No avatar set"));
            }
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add(org.springframework.http.HttpHeaders.CACHE_CONTROL, "private, max-age=300");
            headers.add(org.springframework.http.HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
            return ResponseEntity.ok().headers(headers).body(java.util.Map.of("thumbnailUrl", thumb));
        }

        @GetMapping("/{id}/avatar/thumbnail")
        public ResponseEntity<java.util.Map<String, Object>> getAvatarThumbnail(@PathVariable Long id) {
            var dto = userProfileService.getProfileById(id);
            String thumb = deriveThumbUrl(dto.avatarUrl());
            if (thumb == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                        .headers(noStore())
                        .body(java.util.Map.of("error", "not_found", "message", "No avatar set"));
            }
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=300");
            headers.add(org.springframework.http.HttpHeaders.LAST_MODIFIED, httpDate(System.currentTimeMillis()));
            return ResponseEntity.ok().headers(headers).body(java.util.Map.of("thumbnailUrl", thumb));
        }

        private static String deriveThumbUrl(String originalUrl) {
            if (originalUrl == null || originalUrl.isBlank()) return null;
            int q = originalUrl.indexOf('?'); // preserve query if any
            String base = (q >= 0) ? originalUrl.substring(0, q) : originalUrl;
            String query = (q >= 0) ? originalUrl.substring(q) : "";
            int dot = base.lastIndexOf('.');
            if (dot <= 0 || dot == base.length() - 1) {
                // No extension; append _thumb
                return base + "_thumb" + query;
            }
            return base.substring(0, dot) + "_thumb" + base.substring(dot) + query;
        }

    private static String httpDate(long epochMillis) {
        return java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .withZone(java.time.ZoneOffset.UTC)
                .format(java.time.Instant.ofEpochMilli(epochMillis));
    }

    private static boolean looksLikePng(byte[] h) {
        return h != null && h.length >= 8 &&
                (h[0] & 0xFF) == 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47 &&
                h[4] == 0x0D && h[5] == 0x0A && h[6] == 0x1A && h[7] == 0x0A;
    }

    private static boolean looksLikeJpeg(byte[] h) {
        return h != null && h.length >= 3 &&
                (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF;
    }

    private static boolean looksLikeWebp(byte[] h) {
        return h != null && h.length >= 12 &&
                h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F' &&
                h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P';
    }
}