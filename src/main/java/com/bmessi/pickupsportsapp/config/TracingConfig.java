package com.bmessi.pickupsportsapp.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Provides HTTP client beans that are automatically instrumented by Spring Boot's
 * Micrometer/OpenTelemetry integration. The instrumentation covers outbound
 * {@link RestTemplate} calls and, with the OpenTelemetry exporter on the
 * classpath, JDBC interactions via auto-configuration.
 */
@Configuration
public class TracingConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // RestTemplate built via the builder inherits tracing interceptors.
        return builder.build();
    }

}

