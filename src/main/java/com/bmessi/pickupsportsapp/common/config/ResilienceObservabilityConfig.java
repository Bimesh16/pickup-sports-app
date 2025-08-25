package com.bmessi.pickupsportsapp.common.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class ResilienceObservabilityConfig {

    private final CircuitBreakerRegistry cbRegistry;
    private final MeterRegistry meterRegistry;

    public ResilienceObservabilityConfig(CircuitBreakerRegistry cbRegistry, MeterRegistry meterRegistry) {
        this.cbRegistry = cbRegistry;
        this.meterRegistry = meterRegistry;
    }

    @PostConstruct
    public void init() {
        // Ensure we have a handle on the "xai" circuit breaker used by annotations
        CircuitBreaker cb = cbRegistry.circuitBreaker("xai");

        // Gauge for state: 0=CLOSED,1=HALF_OPEN,2=OPEN,3=DISABLED,4=FORCED_OPEN,5=METRICS_ONLY
        Gauge.builder("cb.state.value", cb, c -> mapState(c.getState()))
                .description("Circuit breaker state for XAI recommendations")
                .tag("name", "xai")
                .register(meterRegistry);

        // Transition counters by target state
        cb.getEventPublisher().onStateTransition(ev ->
                meterRegistry.counter("cb.state.transitions",
                        "name", "xai",
                        "to", ev.getStateTransition().getToState().name()
                ).increment()
        );
    }

    private static int mapState(CircuitBreaker.State s) {
        return switch (s) {
            case CLOSED -> 0;
            case HALF_OPEN -> 1;
            case OPEN -> 2;
            case DISABLED -> 3;
            case FORCED_OPEN -> 4;
            case METRICS_ONLY -> 5;
        };
    }
}
