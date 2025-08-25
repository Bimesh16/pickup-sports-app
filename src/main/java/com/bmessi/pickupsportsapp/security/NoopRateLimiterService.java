package com.bmessi.pickupsportsapp.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * No-op rate limiter used when distributed rate-limiting is disabled.
 * Always allows requests.
 */
@Service
@ConditionalOnProperty(name = "auth.rate-limit.distributed.enabled", havingValue = "false", matchIfMissing = true)
public class NoopRateLimiterService {

    public boolean allow(String key, int limit, int windowSeconds) {
        return true;
    }
}
