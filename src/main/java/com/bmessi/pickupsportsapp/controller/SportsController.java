package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class SportsController {

    private final GameRepository gameRepository;

    @GetMapping("/sports")
    public ResponseEntity<List<String>> getSports(
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch
    ) {
        Set<String> sports = gameRepository.findDistinctSports();
        List<String> sorted = (sports == null || sports.isEmpty())
                ? List.of()
                : sports.stream()
                        .filter(Objects::nonNull)
                        .sorted(Comparator.naturalOrder())
                        .toList();

        // Build a stable weak ETag from the list contents (sha256 of joined string)
        String content = String.join("|", sorted);
        String hash = sha256Base64Url(content);
        String etag = "W/\"" + hash + "\"";

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "public, max-age=300");
        headers.add(HttpHeaders.ETAG, etag);
        headers.add(HttpHeaders.LAST_MODIFIED, httpDate(Instant.now().toEpochMilli()));

        // Honor If-None-Match for conditional GET
        if (ifNoneMatch != null && !ifNoneMatch.isBlank()) {
            String norm = normalizeIfMatch(ifNoneMatch);
            if (hash.equals(norm)) {
                return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
            }
        }

        return ResponseEntity.ok().headers(headers).body(sorted);
    }

    private static String sha256Base64Url(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception e) {
            // Fallback to a simple hash if SHA-256 is unavailable (extremely unlikely)
            return Integer.toHexString(input.hashCode());
        }
    }

    private static String normalizeIfMatch(String raw) {
        String s = raw.trim();
        if (s.startsWith("W/")) s = s.substring(2).trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1);
        }
        return s;
    }

    private static String httpDate(long epochMillis) {
        return java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .withZone(java.time.ZoneOffset.UTC)
                .format(java.time.Instant.ofEpochMilli(epochMillis));
    }
}