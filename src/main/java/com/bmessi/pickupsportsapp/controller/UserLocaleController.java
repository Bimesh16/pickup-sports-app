package com.bmessi.pickupsportsapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/users/me/locale")
@RequiredArgsConstructor
public class UserLocaleController {

    private final JdbcTemplate jdbc;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> get(Principal principal) {
        String locale = resolveLocale(principal.getName());
        return ResponseEntity.ok().headers(noStore()).body(Map.of("locale", locale));
    }

    public record PutLocaleRequest(String locale) {}

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> put(@RequestBody PutLocaleRequest body, Principal principal) {
        String raw = body != null ? body.locale() : null;
        String norm = normalizeLocale(raw);
        jdbc.update("UPDATE app_user SET locale = ? WHERE username = ?", norm, principal.getName());
        return ResponseEntity.ok().headers(noStore()).body(Map.of("locale", norm));
    }

    private String resolveLocale(String username) {
        try {
            return jdbc.queryForObject("SELECT locale FROM app_user WHERE username = ?", String.class, username);
        } catch (Exception e) {
            return null;
        }
    }

    private static String normalizeLocale(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            Locale loc = Locale.forLanguageTag(s);
            if (loc == null || loc.toLanguageTag().isBlank()) return null;
            return loc.toLanguageTag();
        } catch (Exception e) {
            return null;
        }
    }

    private static HttpHeaders noStore() {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.CACHE_CONTROL, "no-store");
        h.add(HttpHeaders.PRAGMA, "no-cache");
        return h;
    }
}
