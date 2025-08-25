package com.bmessi.pickupsportsapp.service.chat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks presence of users in a game's chat channel.
 * Uses Redis ZSET presence:game:{id} with score=lastSeenEpochSeconds when Redis is available,
 * and falls back to an in-memory map otherwise.
 */
@Service
public class ChatPresenceService {

    private final Optional<StringRedisTemplate> redis;
    private final Clock clock;
    private final int ttlSeconds;

    // in-memory fallback: gameId -> (username -> lastSeenEpochSeconds)
    private final ConcurrentHashMap<Long, ConcurrentHashMap<String, Long>> local = new ConcurrentHashMap<>();

    public ChatPresenceService(Optional<StringRedisTemplate> redis,
                               Clock clock,
                               @Value("${chat.presence.ttl-seconds:45}") int ttlSeconds) {
        this.redis = redis;
        this.clock = clock != null ? clock : Clock.systemUTC();
        this.ttlSeconds = Math.max(10, ttlSeconds);
    }

    public PresenceBeat heartbeat(Long gameId, String username) {
        Objects.requireNonNull(gameId, "gameId");
        String user = normalized(username);
        long nowSec = nowSeconds();
        long cutoff = nowSec - ttlSeconds;

        if (redis.isPresent()) {
            String key = redisKey(gameId);
            // prune old
            redis.get().opsForZSet().removeRangeByScore(key, Double.NEGATIVE_INFINITY, cutoff);
            // upsert beat
            redis.get().opsForZSet().add(key, user, nowSec);
            Long count = redis.get().opsForZSet().zCard(key);
            return new PresenceBeat(nowSec, ttlSeconds, count == null ? 0L : count);
        } else {
            var map = local.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>());
            // prune old
            map.entrySet().removeIf(e -> e.getValue() < cutoff);
            map.put(user, nowSec);
            return new PresenceBeat(nowSec, ttlSeconds, (long) map.size());
        }
    }

    public PresenceList list(Long gameId, boolean includeUsers) {
        Objects.requireNonNull(gameId, "gameId");
        long nowSec = nowSeconds();
        long cutoff = nowSec - ttlSeconds;

        if (redis.isPresent()) {
            String key = redisKey(gameId);
            // prune then read
            redis.get().opsForZSet().removeRangeByScore(key, Double.NEGATIVE_INFINITY, cutoff);
            Long count = redis.get().opsForZSet().zCard(key);
            List<String> users = List.of();
            if (includeUsers) {
                Set<String> range = redis.get().opsForZSet().range(key, 0, -1);
                users = range == null ? List.of() : new ArrayList<>(range);
                Collections.sort(users, String::compareToIgnoreCase);
            }
            return new PresenceList(count == null ? 0L : count, users);
        } else {
            var map = local.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>());
            map.entrySet().removeIf(e -> e.getValue() < cutoff);
            List<String> users = includeUsers ? new ArrayList<>(map.keySet()) : List.of();
            if (includeUsers) users.sort(String::compareToIgnoreCase);
            return new PresenceList((long) map.size(), users);
        }
    }

    public int getTtlSeconds() {
        return ttlSeconds;
    }

    private String redisKey(Long gameId) {
        return "presence:game:" + gameId;
    }

    private long nowSeconds() {
        return clock.instant().getEpochSecond();
    }

    private static String normalized(String username) {
        return username == null ? "" : username.trim();
    }

    // DTOs
    public record PresenceBeat(long timestamp, int ttlSeconds, long count) {}
    public record PresenceList(long count, List<String> users) {}
}
