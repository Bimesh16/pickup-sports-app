package com.bmessi.pickupsportsapp.common.config.properties;

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