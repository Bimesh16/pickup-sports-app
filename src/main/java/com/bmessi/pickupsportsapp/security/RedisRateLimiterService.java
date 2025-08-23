package com.bmessi.pickupsportsapp.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Simple Redis-backed rate limiter: counts requests in a sliding-fixed window.
 * Keys are namespaced by caller; TTL is set on first increment.
 */
@Service
@ConditionalOnProperty(name = "auth.rate-limit.distributed.enabled", havingValue = "true")
public class RedisRateLimiterService {

    private final StringRedisTemplate redis;

    public RedisRateLimiterService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public boolean allow(String key, int limit, int windowSeconds) {
        try {
            String namespaced = "rl:" + key;
            Long val = redis.opsForValue().increment(namespaced);
            if (val != null && val == 1L) {
                redis.expire(namespaced, Duration.ofSeconds(windowSeconds));
            }
            return val != null && val <= limit;
        } catch (Exception e) {
            // Fail-open to avoid blocking traffic if Redis is down
            return true;
        }
    }
}
