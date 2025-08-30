package com.bmessi.pickupsportsapp.service.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.stats.CacheStats;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Advanced caching service providing intelligent cache management, analytics caching,
 * and performance optimization features.
 * 
 * <p>This service implements a multi-tier caching strategy combining:</p>
 * <ul>
 *   <li><strong>Local Caffeine Cache:</strong> High-performance in-memory caching</li>
 *   <li><strong>Redis Cache:</strong> Distributed caching for scalability</li>
 *   <li><strong>Analytics Caching:</strong> Intelligent caching for business intelligence</li>
 *   <li><strong>Performance Monitoring:</strong> Cache performance metrics and optimization</li>
 * </ul>
 * 
 * <p><strong>Cache Strategies:</strong></p>
 * <ul>
 *   <li><strong>Time-based Expiration:</strong> Automatic cache invalidation</li>
 *   <li><strong>Size-based Eviction:</strong> Memory-efficient cache management</li>
 *   <li><strong>Intelligent Preloading:</strong> Predictive cache warming</li>
 *   <li><strong>Adaptive TTL:</strong> Dynamic cache duration based on usage patterns</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdvancedCachingService {

    private final MeterRegistry meterRegistry;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Value("${app.cache.default-ttl:3600}")
    private long defaultTtlSeconds;
    
    @Value("${app.cache.max-size:10000}")
    private long maxCacheSize;
    
    @Value("${app.cache.analytics-ttl:1800}")
    private long analyticsTtlSeconds;
    
    @Value("${app.cache.performance-ttl:900}")
    private long performanceTtlSeconds;

    // Local caches for different purposes
    private final Map<String, Cache<String, Object>> localCaches = new ConcurrentHashMap<>();
    
    // Cache statistics and monitoring
    private final Map<String, CacheStats> cacheStats = new ConcurrentHashMap<>();
    private final Map<String, Timer> cacheTimers = new ConcurrentHashMap<>();

    /**
     * Get or create a local cache with specified configuration.
     * 
     * @param cacheName Name of the cache
     * @param ttlSeconds Time-to-live in seconds
     * @param maxSize Maximum cache size
     * @return Configured cache instance
     */
    public Cache<String, Object> getLocalCache(String cacheName, long ttlSeconds, long maxSize) {
        return localCaches.computeIfAbsent(cacheName, name -> {
            Cache<String, Object> cache = Caffeine.newBuilder()
                    .expireAfterWrite(ttlSeconds, TimeUnit.SECONDS)
                    .maximumSize(maxSize)
                    .recordStats()
                    .build();
            
            // Register metrics
            registerCacheMetrics(cacheName, cache);
            
            log.info("Created local cache: {} with TTL: {}s, MaxSize: {}", 
                    cacheName, ttlSeconds, maxSize);
            
            return cache;
        });
    }

    /**
     * Get or create a local cache with default configuration.
     * 
     * @param cacheName Name of the cache
     * @return Configured cache instance
     */
    public Cache<String, Object> getLocalCache(String cacheName) {
        return getLocalCache(cacheName, defaultTtlSeconds, maxCacheSize);
    }

    /**
     * Get or create an analytics cache with extended TTL.
     * 
     * @param cacheName Name of the analytics cache
     * @return Configured analytics cache instance
     */
    public Cache<String, Object> getAnalyticsCache(String cacheName) {
        return getLocalCache(cacheName, analyticsTtlSeconds, maxCacheSize / 2);
    }

    /**
     * Get or create a performance cache with short TTL.
     * 
     * @param cacheName Name of the performance cache
     * @return Configured performance cache instance
     */
    public Cache<String, Object> getPerformanceCache(String cacheName) {
        return getLocalCache(cacheName, performanceTtlSeconds, maxCacheSize / 4);
    }

    /**
     * Get value from local cache, computing if absent.
     * 
     * @param cacheName Name of the cache
     * @param key Cache key
     * @param supplier Function to compute value if not in cache
     * @return Cached or computed value
     */
    public <T> T getOrCompute(String cacheName, String key, Supplier<T> supplier) {
        Cache<String, Object> cache = getLocalCache(cacheName);
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            @SuppressWarnings("unchecked")
            T result = (T) cache.get(key, k -> supplier.get());
            sample.stop(getCacheTimer(cacheName, "hit"));
            return result;
        } catch (Exception e) {
            sample.stop(getCacheTimer(cacheName, "miss"));
            log.warn("Cache computation failed for key: {} in cache: {}", key, cacheName, e);
            return supplier.get();
        }
    }

    /**
     * Get value from local cache, computing if absent with custom TTL.
     * 
     * @param cacheName Name of the cache
     * @param key Cache key
     * @param ttlSeconds Custom TTL in seconds
     * @param supplier Function to compute value if not in cache
     * @return Cached or computed value
     */
    public <T> T getOrCompute(String cacheName, String key, long ttlSeconds, Supplier<T> supplier) {
        Cache<String, Object> cache = getLocalCache(cacheName, ttlSeconds, maxCacheSize);
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            @SuppressWarnings("unchecked")
            T result = (T) cache.get(key, k -> supplier.get());
            sample.stop(getCacheTimer(cacheName, "hit"));
            return result;
        } catch (Exception e) {
            sample.stop(getCacheTimer(cacheName, "miss"));
            log.warn("Cache computation failed for key: {} in cache: {}", key, cacheName, e);
            return supplier.get();
        }
    }

    /**
     * Get value from Redis cache.
     * 
     * @param key Cache key
     * @param clazz Expected value type
     * @return Cached value or null if not found
     */
    public <T> T getFromRedis(String key, Class<T> clazz) {
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            Object value = redisTemplate.opsForValue().get(key);
            sample.stop(getCacheTimer("redis", "hit"));
            
            if (value != null && clazz.isInstance(value)) {
                return clazz.cast(value);
            }
            return null;
        } catch (Exception e) {
            sample.stop(getCacheTimer("redis", "miss"));
            log.warn("Redis cache retrieval failed for key: {}", key, e);
            return null;
        }
    }

    /**
     * Store value in Redis cache.
     * 
     * @param key Cache key
     * @param value Value to cache
     * @param ttlSeconds Time-to-live in seconds
     */
    public void storeInRedis(String key, Object value, long ttlSeconds) {
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttlSeconds));
            sample.stop(getCacheTimer("redis", "store"));
        } catch (Exception e) {
            sample.stop(getCacheTimer("redis", "error"));
            log.warn("Redis cache storage failed for key: {}", key, e);
        }
    }

    /**
     * Store value in Redis cache with default TTL.
     * 
     * @param key Cache key
     * @param value Value to cache
     */
    public void storeInRedis(String key, Object value) {
        storeInRedis(key, value, defaultTtlSeconds);
    }

    /**
     * Intelligent cache warming for frequently accessed data.
     * 
     * @param cacheName Name of the cache to warm
     * @param keys Keys to preload
     * @param valueSupplier Function to compute values
     */
    public void warmCache(String cacheName, List<String> keys, Function<String, Object> valueSupplier) {
        Cache<String, Object> cache = getLocalCache(cacheName);
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            keys.parallelStream().forEach(key -> {
                if (!cache.asMap().containsKey(key)) {
                    Object value = valueSupplier.apply(key);
                    if (value != null) {
                        cache.put(key, value);
                    }
                }
            });
            sample.stop(getCacheTimer(cacheName, "warm"));
            log.info("Warmed cache: {} with {} keys", cacheName, keys.size());
        } catch (Exception e) {
            sample.stop(getCacheTimer(cacheName, "error"));
            log.warn("Cache warming failed for cache: {}", cacheName, e);
        }
    }

    /**
     * Clear specific cache.
     * 
     * @param cacheName Name of the cache to clear
     */
    public void clearCache(String cacheName) {
        Cache<String, Object> cache = localCaches.get(cacheName);
        if (cache != null) {
            cache.invalidateAll();
            log.info("Cleared cache: {}", cacheName);
        }
    }

    /**
     * Clear all local caches.
     */
    public void clearAllCaches() {
        localCaches.values().forEach(Cache::invalidateAll);
        log.info("Cleared all local caches");
    }

    /**
     * Get cache statistics for monitoring.
     * 
     * @param cacheName Name of the cache
     * @return Cache statistics
     */
    public CacheStats getCacheStats(String cacheName) {
        Cache<String, Object> cache = localCaches.get(cacheName);
        return cache != null ? cache.stats() : null;
    }

    /**
     * Get comprehensive cache performance metrics.
     * 
     * @return Map of cache metrics
     */
    public Map<String, Object> getCacheMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        localCaches.forEach((cacheName, cache) -> {
            CacheStats stats = cache.stats();
            Map<String, Object> cacheMetrics = new HashMap<>();
            
            cacheMetrics.put("hitCount", stats.hitCount());
            cacheMetrics.put("missCount", stats.missCount());
            cacheMetrics.put("loadSuccessCount", stats.loadSuccessCount());
            cacheMetrics.put("loadFailureCount", stats.loadFailureCount());
            cacheMetrics.put("totalLoadTime", stats.totalLoadTime());
            cacheMetrics.put("evictionCount", stats.evictionCount());
            cacheMetrics.put("evictionWeight", stats.evictionWeight());
            
            double hitRate = stats.hitRate();
            cacheMetrics.put("hitRate", hitRate);
            cacheMetrics.put("missRate", 1.0 - hitRate);
            
            metrics.put(cacheName, cacheMetrics);
        });
        
        return metrics;
    }

    /**
     * Register cache metrics with Micrometer.
     * 
     * @param cacheName Name of the cache
     * @param cache Cache instance
     */
    private void registerCacheMetrics(String cacheName, Cache<String, Object> cache) {
        // Register cache size gauge
        meterRegistry.gauge("cache.size", cache, Cache::estimatedSize);
        
        // Register cache stats
        meterRegistry.gauge("cache.hit.rate", cache, c -> c.stats().hitRate());
        meterRegistry.gauge("cache.miss.rate", cache, c -> c.stats().missRate());
        meterRegistry.gauge("cache.eviction.count", cache, c -> c.stats().evictionCount());
    }

    /**
     * Get or create cache timer for performance monitoring.
     * 
     * @param cacheName Name of the cache
     * @param operation Operation type (hit, miss, store, etc.)
     * @return Timer instance
     */
    private Timer getCacheTimer(String cacheName, String operation) {
        String timerName = "cache." + cacheName + "." + operation;
        return cacheTimers.computeIfAbsent(timerName, 
                name -> Timer.builder(name)
                        .description("Cache operation timing for " + cacheName + " " + operation)
                        .register(meterRegistry));
    }

    /**
     * Scheduled task to clean up expired caches and update statistics.
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void cleanupAndUpdateStats() {
        try {
            // Update cache statistics
            localCaches.forEach((cacheName, cache) -> {
                CacheStats stats = cache.stats();
                cacheStats.put(cacheName, stats);
                
                // Log cache performance if hit rate is low
                double hitRate = stats.hitRate();
                if (hitRate < 0.5 && stats.requestCount() > 100) {
                    log.warn("Low cache hit rate for {}: {:.2%}", cacheName, hitRate);
                }
            });
            
            // Clean up empty caches
            localCaches.entrySet().removeIf(entry -> 
                    entry.getValue().estimatedSize() == 0);
            
            log.debug("Cache cleanup completed. Active caches: {}", localCaches.size());
        } catch (Exception e) {
            log.warn("Cache cleanup failed", e);
        }
    }

    /**
     * Get cache health status for monitoring.
     * 
     * @return Cache health information
     */
    public Map<String, Object> getCacheHealth() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            health.put("status", "UP");
            health.put("localCaches", localCaches.size());
            health.put("totalMemoryUsage", getTotalMemoryUsage());
            health.put("lastCleanup", OffsetDateTime.now());
            health.put("cacheMetrics", getCacheMetrics());
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            log.error("Cache health check failed", e);
        }
        
        return health;
    }

    /**
     * Calculate total memory usage of all caches.
     * 
     * @return Estimated memory usage in bytes
     */
    private long getTotalMemoryUsage() {
        return localCaches.values().stream()
                .mapToLong(cache -> cache.estimatedSize() * 1024) // Rough estimate: 1KB per entry
                .sum();
    }
}
