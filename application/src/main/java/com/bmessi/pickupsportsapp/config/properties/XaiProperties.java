package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds properties under "xai.*" from application.yml/properties.
 * Example:
 * xai:
 *   enabled: false
 *   api-key: YOUR_KEY
 *   base-url: https://api.x.ai
 */
@ConfigurationProperties(prefix = "xai")
public record XaiProperties(
        String apiKey,
        String baseUrl,
        boolean enabled
) {}
