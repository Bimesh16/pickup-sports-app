package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.UserProfileDTO;
import com.bmessi.pickupsportsapp.service.UserProfileService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.security.Principal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/profiles")
public class ProfileAvatarController {

    private final UserProfileService userProfileService;

    public ProfileAvatarController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }


    @RequestMapping(path = "/{id}/avatar", method = RequestMethod.HEAD)
    public ResponseEntity<Void> headAvatar(@PathVariable Long id) {
        UserProfileDTO dto = userProfileService.getProfileById(id);
        String url = dto.avatarUrl();
        if (url == null || url.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).headers(noStore()).build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.LOCATION, url);
        headers.add(HttpHeaders.ETAG, computeEtag(url));
        headers.add(HttpHeaders.CACHE_CONTROL, "public, max-age=300");
        headers.add(HttpHeaders.LAST_MODIFIED, DateTimeFormatter.RFC_1123_DATE_TIME.withZone(ZoneOffset.UTC)
                .format(Instant.now()));
        return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();
    }

    private static String computeEtag(String value) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String b64 = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(d);
            return "W/\"" + b64 + "\"";
        } catch (Exception e) {
            return "W/\"" + Integer.toHexString(value.hashCode()) + "\"";
        }
    }

    private static String deriveThumbUrl(String originalUrl) {
        if (originalUrl == null || originalUrl.isBlank()) return null;
        int q = originalUrl.indexOf('?');
        String base = (q >= 0) ? originalUrl.substring(0, q) : originalUrl;
        String query = (q >= 0) ? originalUrl.substring(q) : "";
        int dot = base.lastIndexOf('.');
        if (dot <= 0 || dot == base.length() - 1) {
            return base + "_thumb" + query;
        }
        return base.substring(0, dot) + "_thumb" + base.substring(dot) + query;
    }

    private static HttpHeaders cacheHeaders(int maxAgeSeconds, boolean privateCache) {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.CACHE_CONTROL, (privateCache ? "private" : "public") + ", max-age=" + maxAgeSeconds);
        h.add(HttpHeaders.LAST_MODIFIED, DateTimeFormatter.RFC_1123_DATE_TIME.withZone(ZoneOffset.UTC)
                .format(Instant.now()));
        return h;
    }

    
}
