package com.bmessi.pickupsportsapp.health;

import com.bmessi.pickupsportsapp.integration.xai.XaiApiClient;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Health indicator for the external XAI recommendations service.
 * Performs a lightweight recommendation request and reports the
 * circuit breaker state to avoid cascading failures.
 */
@Component("xai")
public class XaiHealthIndicator implements HealthIndicator {

    private final Optional<XaiApiClient> xaiApiClient;
    private final CircuitBreaker circuitBreaker;

    public XaiHealthIndicator(Optional<XaiApiClient> xaiApiClient,
                              CircuitBreakerRegistry cbRegistry) {
        this.xaiApiClient = xaiApiClient;
        this.circuitBreaker = cbRegistry.circuitBreaker("xai");
    }

    @Override
    public Health health() {
        if (xaiApiClient.isEmpty()) {
            return Health.unknown()
                    .withDetail("available", false)
                    .withDetail("reason", "xai-disabled")
                    .build();
        }

        CircuitBreaker.State state = circuitBreaker.getState();
        if (state == CircuitBreaker.State.OPEN || state == CircuitBreaker.State.FORCED_OPEN) {
            return Health.status("OPEN")
                    .withDetail("available", false)
                    .withDetail("reason", "circuit-breaker-open")
                    .build();
        }

        try {
            Optional<List<XaiApiClient.RecommendationHint>> recs =
                    xaiApiClient.get().getRecommendations(null, null, 0, 1);
            if (recs.isPresent()) {
                return Health.up()
                        .withDetail("recommendations", recs.get().size())
                        .withDetail("circuitBreaker", state.name())
                        .build();
            }
            return Health.down()
                    .withDetail("recommendations", 0)
                    .withDetail("circuitBreaker", state.name())
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("circuitBreaker", state.name())
                    .build();
        }
    }
}

