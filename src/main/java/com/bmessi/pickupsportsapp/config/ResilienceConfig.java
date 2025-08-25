package com.bmessi.pickupsportsapp.config;

import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import io.github.resilience4j.retry.RetryConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.Duration;
import java.util.concurrent.Executor;

@Configuration
public class ResilienceConfig {

    @Bean
    public RetryConfig xaiRetryConfig() {
        return RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(200))
                .retryExceptions(RuntimeException.class)
                .build();
    }

    @Bean
    public TimeLimiterConfig xaiTimeLimiterConfig() {
        return TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(2))
                .build();
    }

    @Bean
    public RateLimiterConfig xaiRateLimiterConfig() {
        return RateLimiterConfig.custom()
                .limitRefreshPeriod(Duration.ofSeconds(1))
                .limitForPeriod(10)
                .timeoutDuration(Duration.ofMillis(0))
                .build();
    }

    @Bean(name = "games")
    public RateLimiterConfig gamesRateLimiterConfig() {
        return RateLimiterConfig.custom()
                .limitRefreshPeriod(Duration.ofSeconds(60))
                .limitForPeriod(5)
                .timeoutDuration(Duration.ofMillis(0))
                .build();
    }

    /**
     * Dedicated bounded executor for XAI async calls used by TimeLimiter/CircuitBreaker.
     */
    @Bean(name = "xaiExecutor")
    public Executor xaiExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(4);
        exec.setMaxPoolSize(8);
        exec.setQueueCapacity(100);
        exec.setThreadNamePrefix("xai-");
        exec.initialize();
        return exec;
    }
}