package com.bmessi.pickupsportsapp.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        var sportsCache = new CaffeineCache(
                "sports",
                Caffeine.newBuilder()
                        .maximumSize(500)
                        .expireAfterWrite(Duration.ofMinutes(5))
                        .build()
        );

        var filtersCache = new CaffeineCache(
                "search-filters",
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .expireAfterWrite(Duration.ofMinutes(5))
                        .build()
        );

        var notificationsFirstPage = new CaffeineCache(
                "notifications-first-page",
                Caffeine.newBuilder()
                        .maximumSize(5_000)
                        .expireAfterWrite(Duration.ofSeconds(60))
                        .build()
        );

        var mgr = new SimpleCacheManager();
        mgr.setCaches(List.of(sportsCache, filtersCache, notificationsFirstPage));
        return mgr;
    }
}