package com.bmessi.pickupsportsapp.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(
        String allowedOrigins,
        String allowedMethods,
        String allowedHeaders,
        String exposedHeaders,
        boolean allowCredentials
) {}