package com.bmessi.pickupsportsapp.service.presence;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresenceServiceImpl implements PresenceService {

    private final StringRedisTemplate redis;
    private final MeterRegistry meterRegistry;

    // If clients send heartbeat every ~20s, a 30s TTL gives buffer for jitter.
    private static final long TTL_SECONDS = 30L;
    private static final Duration KEY_TTL = Duration.ofSeconds(TTL_SECONDS * 2); // key safety TTL

    private String key(Long gameId) {
        return "presence:game:" + gameId;
    }

    @Override
    public boolean heartbeat(Long gameId, String username) {
        Timer.Sample sample = Timer.start(meterRegistry);
        validate(gameId, username);
        long now = Instant.now().getEpochSecond();
        String k = key(gameId);

        // Drop stale members first
        long cutoff = now - TTL_SECONDS;
        redis.opsForZSet().removeRangeByScore(k, 0, cutoff - 1);

        // Check if this is a join (no existing score or stale previously)
        Double existing = redis.opsForZSet().score(k, username);
        boolean wasOffline = (existing == null) || (existing.longValue() < cutoff);

        // Upsert last-seen
        redis.opsForZSet().add(k, username, now);

        // Keep key from lingering forever
        redis.expire(k, KEY_TTL);

        meterRegistry.counter("presence.heartbeat.counter").increment();
        sample.stop(meterRegistry.timer("presence.heartbeat.timer"));
        return wasOffline;
    }

    @Override
    public void leave(Long gameId, String username) {
        validate(gameId, username);
        redis.opsForZSet().remove(key(gameId), username);
    }

    @Override
    public Set<String> online(Long gameId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        Assert.notNull(gameId, "gameId must not be null");
        long now = Instant.now().getEpochSecond();
        long cutoff = now - TTL_SECONDS;

        Set<ZSetOperations.TypedTuple<String>> tuples =
                redis.opsForZSet().rangeByScoreWithScores(key(gameId), cutoff, Double.POSITIVE_INFINITY);

        Set<String> result = (tuples == null)
                ? Set.of()
                : tuples.stream().map(ZSetOperations.TypedTuple::getValue).collect(Collectors.toSet());
        meterRegistry.counter("presence.online.counter").increment();
        sample.stop(meterRegistry.timer("presence.online.timer"));
        return result;
    }

    @Override
    public long onlineCount(Long gameId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        Assert.notNull(gameId, "gameId must not be null");
        long now = Instant.now().getEpochSecond();
        long cutoff = now - TTL_SECONDS;
        Long cnt = redis.opsForZSet().count(key(gameId), cutoff, Double.POSITIVE_INFINITY);
        long result = (cnt == null) ? 0L : cnt;
        meterRegistry.counter("presence.onlineCount.counter").increment();
        sample.stop(meterRegistry.timer("presence.onlineCount.timer"));
        return result;
    }

    private static void validate(Long gameId, String username) {
        Assert.notNull(gameId, "gameId must not be null");
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("username must not be blank");
        }
    }
}
