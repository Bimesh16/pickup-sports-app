package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.binder.cache.CaffeineCacheMetrics;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

/**
 * Service providing cached access to game details with metrics.
 */
@Service
public class GameService {

    private final GameRepository gameRepository;
    private final MeterRegistry meterRegistry;
    private final Cache gameDetailsCache;
    private final Timer queryTimer;

    public GameService(GameRepository gameRepository, CacheManager cacheManager, MeterRegistry meterRegistry) {
        this.gameRepository = gameRepository;
        this.meterRegistry = meterRegistry;
        this.gameDetailsCache = cacheManager.getCache("game-details");
        if (this.gameDetailsCache instanceof CaffeineCache caffeineCache) {
            com.github.benmanes.caffeine.cache.Cache<?, ?> nativeCache = caffeineCache.getNativeCache();
            CaffeineCacheMetrics.monitor(meterRegistry, nativeCache, "game-details");
            Gauge.builder("game.details.cache.hit.ratio", nativeCache, c -> c.stats().hitRate())
                    .description("Hit ratio for game details cache")
                    .register(meterRegistry);
        }
        this.queryTimer = Timer.builder("game.details.query.latency")
                .description("Time spent loading game details from the database")
                .register(meterRegistry);
    }

    /**
     * Fetch a game with its participants, caching the result for a short TTL.
     */
    @Nullable
    @Cacheable(cacheNames = "game-details", key = "#id", unless = "#result == null")
    public Game getGameWithParticipants(Long id) {
        return queryTimer.record(() -> gameRepository.findWithParticipantsById(id).orElse(null));
    }
}
