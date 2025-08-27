package com.bmessi.pickupsportsapp.service.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    public record StoredResponse(int status, Object body) {}

    private final IdempotencyRepository repository;
    private final ObjectMapper objectMapper;

    public Optional<StoredResponse> get(String action, String username, Long gameId, String key) {
        String k = compound(action, username, gameId, key);
        return repository.findById(k).map(r -> {
            Object body = deserialize(r.getBody());
            return new StoredResponse(r.getStatus(), body);
        });
    }

    public void put(String action, String username, Long gameId, String key, int status, Object body) {
        String k = compound(action, username, gameId, key);
        String json;
        try {
            json = objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            json = null;
        }
        repository.save(IdempotencyRecord.builder()
                .key(k)
                .status(status)
                .body(json)
                .build());
    }

    @Scheduled(cron = "0 0 * * * *")
    public void cleanup() {
        Instant cutoff = Instant.now().minus(Duration.ofHours(24));
        repository.deleteByCreatedAtBefore(cutoff);
    }

    private Object deserialize(String json) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return null;
        }
    }

    private static String compound(String action, String username, Long gameId, String key) {
        String a = action == null ? "" : action.trim();
        String u = username == null ? "" : username.trim().toLowerCase();
        String g = gameId == null ? "" : String.valueOf(gameId);
        String kk = key == null ? "" : key.trim();
        return a + "|" + u + "|" + g + "|" + kk;
    }
}
