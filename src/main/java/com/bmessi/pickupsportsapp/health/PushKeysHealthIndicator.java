package com.bmessi.pickupsportsapp.health;

import com.bmessi.pickupsportsapp.common.config.properties.VapidProperties;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class PushKeysHealthIndicator implements HealthIndicator {

    private final VapidProperties vapid;

    public PushKeysHealthIndicator(VapidProperties vapid) {
        this.vapid = vapid;
    }

    @Override
    public Health health() {
        boolean pub = vapid.getPublicKey() != null && !vapid.getPublicKey().isBlank();
        boolean pri = vapid.getPrivateKey() != null && !vapid.getPrivateKey().isBlank();
        if (pub && pri) {
            return Health.up().withDetail("vapid", "configured").build();
        }
        return Health.unknown().withDetail("vapid", "missing").build();
    }
}
