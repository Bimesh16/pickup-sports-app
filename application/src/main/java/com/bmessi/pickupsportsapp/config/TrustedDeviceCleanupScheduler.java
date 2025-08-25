package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.repository.TrustedDeviceRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class TrustedDeviceCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(TrustedDeviceCleanupScheduler.class);

    private final TrustedDeviceRepository repo;
    private final MeterRegistry meterRegistry;

    // Run daily at 04:05
    @Scheduled(cron = "${auth.mfa.trusted.cleanup.cron:0 5 4 * * *}")
    public void cleanup() {
        try {
            int n = repo.deleteByTrustedUntilBefore(Instant.now());
            meterRegistry.counter("trusted.devices.cleaned").increment(n);
            if (n > 0) {
                log.info("Cleaned {} expired trusted devices", n);
            }
        } catch (Exception e) {
            log.warn("Trusted device cleanup failed: {}", e.getMessage(), e);
            meterRegistry.counter("trusted.devices.cleanup.failed").increment();
        }
    }
}
