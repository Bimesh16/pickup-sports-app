package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(
        String secret,
        String issuer,
        String audience,
        long expirationMinutes,
        String header,
        String prefix
) {}