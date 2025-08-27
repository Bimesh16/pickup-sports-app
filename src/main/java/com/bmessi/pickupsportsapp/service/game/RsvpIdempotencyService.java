package com.bmessi.pickupsportsapp.service.game;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class RsvpIdempotencyService {

    public record StoredResponse(int status, Object body) {}

    private final Cache<String, StoredResponse> joins = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(20_000)
            .build();

    private final Cache<String, StoredResponse> leaves = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(20_000)
            .build();

    public Optional<StoredResponse> getJoin(String username, Long gameId, String key) {
        String k = compound(username, gameId, key);
        return Optional.ofNullable(joins.getIfPresent(k));
    }

    public void putJoin(String username, Long gameId, String key, int status, Object body) {
        String k = compound(username, gameId, key);
        joins.put(k, new StoredResponse(status, body));
    }

    public Optional<StoredResponse> getLeave(String username, Long gameId, String key) {
        String k = compound(username, gameId, key);
        return Optional.ofNullable(leaves.getIfPresent(k));
    }

    public void putLeave(String username, Long gameId, String key, int status, Object body) {
        String k = compound(username, gameId, key);
        leaves.put(k, new StoredResponse(status, body));
    }

    private static String compound(String username, Long gameId, String key) {
        String u = username == null ? "" : username.trim().toLowerCase();
        String g = gameId == null ? "" : String.valueOf(gameId);
        String kk = key == null ? "" : key.trim();
        return u + "|" + g + "|" + kk;
    }
}
