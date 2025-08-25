package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.repository.MfaRecoveryCodeRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class MfaRecoveryCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(MfaRecoveryCleanupScheduler.class);

    private final JdbcTemplate jdbc;

    // Default: remove consumed codes older than 30 days, daily at 04:15
    @Scheduled(cron = "${mfa.recovery.cleanup.cron:0 15 4 * * *}")
    public void cleanup() {
        Instant cutoff = Instant.now().minus(30, ChronoUnit.DAYS);
        try {
            int n = jdbc.update("DELETE FROM mfa_recovery_code WHERE consumed_at IS NOT NULL AND consumed_at < ?", java.sql.Timestamp.from(cutoff));
            if (n > 0) log.info("Removed {} stale consumed MFA recovery codes", n);
        } catch (Exception e) {
            log.warn("MFA recovery cleanup failed: {}", e.getMessage(), e);
        }
    }
}
