package com.bmessi.pickupsportsapp.common.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@EnableScheduling
public class TokenCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(TokenCleanupScheduler.class);

    @PersistenceContext
    private EntityManager em;

    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    public TokenCleanupScheduler(io.micrometer.core.instrument.MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    // Run daily at 03:15
    @Scheduled(cron = "0 15 3 * * *")
    @Transactional
    public void purgeExpiredRefreshTokens() {
        Instant now = Instant.now();

        int deletedRefresh = em.createQuery("delete from RefreshToken rt where (rt.expiresAt is not null and rt.expiresAt < :now)")
                .setParameter("now", now)
                .executeUpdate();

        int deletedVerif = em.createQuery("delete from VerificationToken vt where (vt.expiresAt is not null and vt.expiresAt < :now)")
                .setParameter("now", now)
                .executeUpdate();

        int deletedReset = em.createQuery("delete from PasswordResetToken prt where (prt.expiresAt is not null and prt.expiresAt < :now)")
                .setParameter("now", now)
                .executeUpdate();

        try {
            meterRegistry.counter("tokens.cleanup.deleted", "type", "refresh").increment(deletedRefresh);
            meterRegistry.counter("tokens.cleanup.deleted", "type", "verification").increment(deletedVerif);
            meterRegistry.counter("tokens.cleanup.deleted", "type", "reset").increment(deletedReset);
        } catch (Exception ignore) {}

        if (deletedRefresh > 0 || deletedVerif > 0 || deletedReset > 0) {
            log.info("Token cleanup: refresh={}, verification={}, reset={}", deletedRefresh, deletedVerif, deletedReset);
        }
    }
}
