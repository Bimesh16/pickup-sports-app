package com.bmessi.pickupsportsapp.health;

import com.bmessi.pickupsportsapp.media.StorageProvider;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@Component("storage")
public class StorageHealthIndicator implements HealthIndicator {

    private final StorageProvider storageProvider;

    public StorageHealthIndicator(StorageProvider storageProvider) {
        this.storageProvider = storageProvider;
    }

    @Override
    public Health health() {
        String rel = "healthcheck/.ok";
        try {
            byte[] payload = "ok".getBytes(StandardCharsets.UTF_8);
            var path = storageProvider.store(rel, new ByteArrayInputStream(payload));
            boolean exists = Files.exists(path);
            storageProvider.delete(rel);
            if (exists) {
                return Health.up().withDetail("provider", storageProvider.getClass().getSimpleName()).build();
            }
            return Health.down().withDetail("provider", storageProvider.getClass().getSimpleName()).withDetail("reason", "write_failed").build();
        } catch (Exception e) {
            return Health.down().withDetail("provider", storageProvider.getClass().getSimpleName()).withDetail("error", e.getMessage()).build();
        }
    }
}
