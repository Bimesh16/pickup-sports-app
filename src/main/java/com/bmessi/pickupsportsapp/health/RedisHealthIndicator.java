package com.bmessi.pickupsportsapp.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.data.redis.connection.RedisConnection;

import java.util.Optional;

@Component
public class RedisHealthIndicator implements HealthIndicator {

    private final Optional<StringRedisTemplate> redis;

    public RedisHealthIndicator(Optional<StringRedisTemplate> redis) {
        this.redis = redis;
    }

    @Override
    public Health health() {
        if (redis.isEmpty()) {
            return Health.unknown().withDetail("available", false).withDetail("reason", "redis-template-missing").build();
        }
        try {
            // Use try-with-resources to automatically close the connection
            try (RedisConnection connection = redis.get().getConnectionFactory().getConnection()) {
                String pong = connection.ping();
                boolean ok = pong != null && !pong.isBlank();
                return ok ? Health.up().withDetail("ping", pong).build()
                          : Health.down().withDetail("ping", pong).build();
            }
        } catch (Exception e) {
            return Health.down().withDetail("error", e.getMessage()).build();
        }
    }
}
