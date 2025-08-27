package com.bmessi.pickupsportsapp.service.game;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.micrometer.core.instrument.MeterRegistry;
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

    private final Cache<String, StoredResponse> holds = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(20_000)
            .build();

    private final Cache<String, StoredResponse> confirms = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(20_000)
            .build();

    private final MeterRegistry meterRegistry;

    public RsvpIdempotencyService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public Optional<StoredResponse> getJoin(String username, Long gameId, String key) {
        String k = compound(username, gameId, key);
        StoredResponse res = joins.getIfPresent(k);
        try { meterRegistry.counter("idempotency.rsvp", "operation", "join", "result", res != null ? "hit" : "miss").increment(); } catch (Exception ignore) {}
        return Optional.ofNullable(res);
    }

    public void putJoin(String username, Long gameId, String key, int status, Object body) {
        String k = compound(username, gameId, key);
        joins.put(k, new StoredResponse(status, body));
    }

    public Optional<StoredResponse> getLeave(String username, Long gameId, String key) {
        String k = compound(username, gameId, key);
        StoredResponse res = leaves.getIfPresent(k);
        try { meterRegistry.counter("idempotency.rsvp", "operation", "leave", "result", res != null ? "hit" : "miss").increment(); } catch (Exception ignore) {}
        return Optional.ofNullable(res);
    }

    public void putLeave(String username, Long gameId, String key, int status, Object body) {
        String k = compound(username, gameId, key);
        leaves.put(k, new StoredResponse(status, body));
    }

    public Optional<StoredResponse> getHold(String username, Long gameId, String key) {
        String k = compound(username, gameId, key);
        StoredResponse res = holds.getIfPresent(k);
        try { meterRegistry.counter("idempotency.rsvp", "operation", "hold", "result", res != null ? "hit" : "miss").increment(); } catch (Exception ignore) {}
        return Optional.ofNullable(res);
    }

    public void putHold(String username, Long gameId, String key, int status, Object body) {
        String k = compound(username, gameId, key);
        holds.put(k, new StoredResponse(status, body));
    }

    public Optional<StoredResponse> getConfirm(String username, Long gameId, Long holdId, String key) {
        String k = compound(username, gameId, holdId, key);
        StoredResponse res = confirms.getIfPresent(k);
        try { meterRegistry.counter("idempotency.rsvp", "operation", "confirm", "result", res != null ? "hit" : "miss").increment(); } catch (Exception ignore) {}
        return Optional.ofNullable(res);
    }

    public void putConfirm(String username, Long gameId, Long holdId, String key, int status, Object body) {
        String k = compound(username, gameId, holdId, key);
        confirms.put(k, new StoredResponse(status, body));
    }

    private static String compound(String username, Long gameId, String key) {
        String u = username == null ? "" : username.trim().toLowerCase();
        String g = gameId == null ? "" : String.valueOf(gameId);
        String kk = key == null ? "" : key.trim();
        return u + "|" + g + "|" + kk;
    }

    private static String compound(String username, Long gameId, Long holdId, String key) {
        String u = username == null ? "" : username.trim().toLowerCase();
        String g = gameId == null ? "" : String.valueOf(gameId);
        String h = holdId == null ? "" : String.valueOf(holdId);
        String kk = key == null ? "" : key.trim();
        return u + "|" + g + "|" + h + "|" + kk;
    }
}
