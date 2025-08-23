package com.bmessi.pickupsportsapp.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

/**
 * Simple in-memory idempotency store keyed by "user:Idempotency-Key".
 * Use for best-effort deduplication of unsafe operations (e.g., POST /games).
 */
@Service
public class IdempotencyService {

    private final Cache<String, Long> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(10_000)
            .build();

    /**
     * Returns the stored entity id if this user+key pair was used before.
     */
    public Optional<Long> get(String username, String key) {
        String k = compound(username, key);
        return Optional.ofNullable(cache.getIfPresent(k));
    }

    /**
     * Stores the mapping from user+key to entity id.
     */
    public void put(String username, String key, Long entityId) {
        String k = compound(username, key);
        cache.put(k, entityId);
    }

    private static String compound(String username, String key) {
        String u = username == null ? "" : username.trim().toLowerCase();
        String kk = key == null ? "" : key.trim();
        return u + "|" + kk;
    }
}
