package com.bmessi.pickupsportsapp.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "push.delivery")
public class PushDeliveryProperties {
    private int maxRetries = 5;
    private long baseBackoffMs = 5000;
    private long maxBackoffMs = 300000;

    public int getMaxRetries() { return maxRetries; }
    public void setMaxRetries(int maxRetries) { this.maxRetries = maxRetries; }
    public long getBaseBackoffMs() { return baseBackoffMs; }
    public void setBaseBackoffMs(long baseBackoffMs) { this.baseBackoffMs = baseBackoffMs; }
    public long getMaxBackoffMs() { return maxBackoffMs; }
    public void setMaxBackoffMs(long maxBackoffMs) { this.maxBackoffMs = maxBackoffMs; }
}
