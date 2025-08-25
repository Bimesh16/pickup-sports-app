package com.bmessi.pickupsportsapp.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Unified cache configuration:
 * - Uses Redis when a RedisConnectionFactory bean is available.
 * - Falls back to Caffeine (in-memory) otherwise.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(org.springframework.beans.factory.ObjectProvider<RedisConnectionFactory> redisFactoryProvider) {
        RedisConnectionFactory connectionFactory = redisFactoryProvider.getIfAvailable();
        if (connectionFactory != null) {
            RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(5))
                    .disableCachingNullValues();
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(base)
                    .withCacheConfiguration("sports-list", base.entryTtl(Duration.ofMinutes(10)))
                    .withCacheConfiguration("explore-first", base.entryTtl(Duration.ofSeconds(30)))
                    .withCacheConfiguration("profile", base.entryTtl(Duration.ofMinutes(2)))
                    .build();
        }

        // Caffeine fallback
        List<CaffeineCache> caches = new ArrayList<>();
        caches.add(new CaffeineCache(
                "sports-list",
                Caffeine.newBuilder()
                        .maximumSize(500)
                        .expireAfterWrite(Duration.ofMinutes(10))
                        .build()
        ));
        caches.add(new CaffeineCache(
                "explore-first",
                Caffeine.newBuilder()
                        .maximumSize(5_000)
                        .expireAfterWrite(Duration.ofSeconds(30))
                        .build()
        ));
        caches.add(new CaffeineCache(
                "profile",
                Caffeine.newBuilder()
                        .maximumSize(10_000)
                        .expireAfterWrite(Duration.ofMinutes(2))
                        .build()
        ));
        // Optional extra caches
        caches.add(new CaffeineCache(
                "search-filters",
                Caffeine.newBuilder()
                        .maximumSize(1_000)
                        .expireAfterWrite(Duration.ofMinutes(5))
                        .build()
        ));
        caches.add(new CaffeineCache(
                "notifications-first-page",
                Caffeine.newBuilder()
                        .maximumSize(5_000)
                        .expireAfterWrite(Duration.ofSeconds(60))
                        .build()
        ));

        SimpleCacheManager mgr = new SimpleCacheManager();
        mgr.setCaches(caches);
        return mgr;
    }
}