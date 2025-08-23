package com.bmessi.pickupsportsapp.service.gameaccess;

import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class GameAccessServiceImpl implements GameAccessService {

    private final GameRepository gameRepository;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @org.springframework.beans.factory.annotation.Value("${app.games.access.cache-ttl-seconds:30}")
    private long ttlSeconds = 30;

    @jakarta.annotation.PostConstruct
    void initMetrics() {
        io.micrometer.core.instrument.Gauge.builder("game.access.cache.size", cache, Map::size)
                .description("Entries in the game access cache")
                .register(meterRegistry);
    }

    private static final class Entry {
        final boolean allowed;
        final long expiresAtEpochSec;
        Entry(boolean allowed, long expiresAtEpochSec) {
            this.allowed = allowed; this.expiresAtEpochSec = expiresAtEpochSec;
        }
    }
    private final Map<String, Entry> cache = new ConcurrentHashMap<>();

    @Override
    public boolean canAccessGame(Long gameId, String username) {
        if (gameId == null || username == null || username.isBlank()) return false;

        final String key = gameId + "|" + username.toLowerCase();
        final long now = Instant.now().getEpochSecond();

        Entry e = cache.get(key);
        if (e != null && e.expiresAtEpochSec > now) {
            meterRegistry.counter("game.access.cache", "result", "hit").increment();
            return e.allowed;
        }
        meterRegistry.counter("game.access.cache", "result", "miss").increment();

        // Fetch game with participants and creator eagerly
        var gameOpt = gameRepository.findWithParticipantsById(gameId);
        boolean allowed = gameOpt.map(g -> {
            String creatorUsername = (g.getUser() != null) ? g.getUser().getUsername() : null;
            if (Objects.equals(username, creatorUsername)) return true;

            // Participant membership
            return g.getParticipants() != null && g.getParticipants().stream()
                    .anyMatch(u -> username.equals(u.getUsername()));
        }).orElse(false);

        long ttl = (ttlSeconds <= 0 ? 30 : ttlSeconds);
        cache.put(key, new Entry(allowed, now + ttl));
        return allowed;
    }

    @Override
    public void invalidateForGame(Long gameId) {
        if (gameId == null) return;
        long start = System.nanoTime();
        String prefix = String.valueOf(gameId) + "|";
        int before = cache.size();
        cache.keySet().removeIf(k -> k.startsWith(prefix));
        int evicted = Math.max(0, before - cache.size());
        try {
            meterRegistry.counter("game.access.cache.evictions").increment(evicted);
            meterRegistry.counter("game.access.cache.invalidate", "gameId", String.valueOf(gameId)).increment();
            meterRegistry.timer("game.access.cache.invalidate.time").record(System.nanoTime() - start, java.util.concurrent.TimeUnit.NANOSECONDS);
        } catch (Exception ignore) {}
    }
}
