package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "xai.api")
public record XaiProperties(
        String url,
        String key,
        int timeoutMs
) {}