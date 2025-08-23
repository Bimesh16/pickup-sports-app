package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.GameSummaryDTO;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

/**
 * Wraps AI recommendations with resilience and provides a graceful fallback to DB search.
 */
@Service
public class AiRecommendationResilientService {

    private final Optional<XaiRecommendationService> delegate; // present only when xai.enabled=true
    private final GameRepository gameRepository;
    private final ApiMapper mapper;
    private final Executor xaiExecutor;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    private static final ThreadLocal<String> LAST_SOURCE = new ThreadLocal<>();

    public String getLastSource() {
        String v = LAST_SOURCE.get();
        return v == null ? "fallback" : v;
    }

    public AiRecommendationResilientService(Optional<XaiRecommendationService> delegate,
                                            GameRepository gameRepository,
                                            ApiMapper mapper,
                                            @Qualifier("xaiExecutor") Executor xaiExecutor, io.micrometer.core.instrument.MeterRegistry meterRegistry) {
        this.delegate = delegate;
        this.gameRepository = gameRepository;
        this.mapper = mapper;
        this.xaiExecutor = xaiExecutor;
        this.meterRegistry = meterRegistry;
    }

    @Retry(name = "xai")
    @TimeLimiter(name = "xai")
    @RateLimiter(name = "xai")
    @CircuitBreaker(name = "xai", fallbackMethod = "fallbackRecommendAsync")
    public CompletableFuture<Page<GameSummaryDTO>> recommend(String sport,
                                                             String location,
                                                             String skillLevel,
                                                             Pageable pageable) {
        return CompletableFuture.supplyAsync(() -> {
            if (delegate.isPresent()) {
                var page = delegate.get()
                        .getRecommendations(sport, location, skillLevel, pageable)
                        .map(mapper::toGameSummaryDTO);
                LAST_SOURCE.set("xai");
                try { meterRegistry.counter("recommendations.source", "source", "xai").increment(); } catch (Exception ignore) {}
                return page;
            }
            LAST_SOURCE.set("fallback");
            try { meterRegistry.counter("recommendations.source", "source", "fallback").increment(); } catch (Exception ignore) {}
            return fallbackRecommend(sport, location, skillLevel, pageable);
        }, xaiExecutor).exceptionally(ex -> {
            LAST_SOURCE.set("fallback");
            try { meterRegistry.counter("recommendations.source", "source", "fallback").increment(); } catch (Exception ignore) {}
            return fallbackRecommend(sport, location, skillLevel, pageable);
        });
    }

    // Fallback for CircuitBreaker short-circuits (must match method signature + Throwable tail param)
    private CompletableFuture<Page<GameSummaryDTO>> fallbackRecommendAsync(String sport,
                                                                           String location,
                                                                           String skillLevel,
                                                                           Pageable pageable,
                                                                           Throwable ex) {
        return CompletableFuture.completedFuture(fallbackRecommend(sport, location, skillLevel, pageable));
    }

    private Page<GameSummaryDTO> fallbackRecommend(String sport,
                                                   String location,
                                                   String skillLevel,
                                                   Pageable pageable) {
        var page = gameRepository.search(
                sport, location,
                (OffsetDateTime) null, (OffsetDateTime) null,
                skillLevel, pageable
        );
        return page.map(mapper::toGameSummaryDTO);
    }
}