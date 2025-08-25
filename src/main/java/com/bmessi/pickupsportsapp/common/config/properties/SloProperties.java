package com.bmessi.pickupsportsapp.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "slo")
public class SloProperties {
    /**
     * Enable synthetic monitors.
     */
    private boolean syntheticEnabled = true;

    /**
     * Timeout for synthetic HTTP calls in milliseconds.
     */
    private int syntheticTimeoutMs = 4000;

    /**
     * Base URL used by synthetic monitors (defaults to http://localhost:8080).
     */
    private String baseUrl = "http://localhost:8080";

    public boolean isSyntheticEnabled() { return syntheticEnabled; }
    public void setSyntheticEnabled(boolean syntheticEnabled) { this.syntheticEnabled = syntheticEnabled; }

    public int getSyntheticTimeoutMs() { return syntheticTimeoutMs; }
    public void setSyntheticTimeoutMs(int syntheticTimeoutMs) { this.syntheticTimeoutMs = syntheticTimeoutMs; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
}
