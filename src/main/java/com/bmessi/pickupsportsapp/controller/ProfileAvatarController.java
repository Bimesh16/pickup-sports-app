package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.UserProfileDTO;
import com.bmessi.pickupsportsapp.service.UserProfileService;
import com.bmessi.pickupsportsapp.controller.profile.ProfileUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).headers(noStoreHeaders()).build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.LOCATION, url);
        headers.add(HttpHeaders.ETAG, ProfileUtils.computeEtag(url));
        headers.add(HttpHeaders.CACHE_CONTROL, "public, max-age=300");
        headers.add(HttpHeaders.LAST_MODIFIED, DateTimeFormatter.RFC_1123_DATE_TIME.withZone(ZoneOffset.UTC)
                .format(Instant.now()));
        return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();
    }
    private static HttpHeaders cacheHeaders(int maxAgeSeconds, boolean privateCache) {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.CACHE_CONTROL, (privateCache ? "private" : "public") + ", max-age=" + maxAgeSeconds);
        h.add(HttpHeaders.LAST_MODIFIED, DateTimeFormatter.RFC_1123_DATE_TIME.withZone(ZoneOffset.UTC)
                .format(Instant.now()));
        return h;
    }

    private static HttpHeaders noStoreHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.CACHE_CONTROL, "no-store");
        h.add(HttpHeaders.PRAGMA, "no-cache");
        return h;
    }
}
