package com.bmessi.pickupsportsapp.common.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Periodically removes old chat artifacts based on retention settings.
 */
@Component
@EnableScheduling
public class RetentionCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(RetentionCleanupScheduler.class);

    @PersistenceContext
    private EntityManager em;

    private final MeterRegistry meterRegistry;

    public RetentionCleanupScheduler(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Value("${retention.chat.messages.days:60}")
    private int chatMessagesDays;

    @Value("${retention.chat.read-receipts.days:60}")
    private int chatReceiptsDays;

    @Value("${retention.notifications.days:0}")
    private int notificationsDays;

    private final AtomicLong lastRun = new AtomicLong(0);

    @PostConstruct
    void metrics() {
        Gauge.builder("retention.cleanup.lastRunEpochMs", lastRun, AtomicLong::get)
                .description("Last run epoch millis for retention cleanup")
                .register(meterRegistry);
    }

    // Run every day at 04:20
    @Scheduled(cron = "0 20 4 * * *")
    @Transactional
    public void cleanupOldChatArtifacts() {
        long startNs = System.nanoTime();
        int deletedMsgs = 0;
        int deletedReceipts = 0;
        int deletedNotifs = 0;

        try {
            if (chatMessagesDays > 0) {
                Instant cutoff = Instant.now().minus(chatMessagesDays, ChronoUnit.DAYS);
                deletedMsgs = em.createQuery("delete from ChatMessage m where m.sentAt < :cutoff")
                        .setParameter("cutoff", cutoff)
                        .executeUpdate();
            }
        } catch (Exception e) {
            log.warn("Failed to cleanup ChatMessage: {}", e.getMessage());
        }

        try {
            if (chatReceiptsDays > 0) {
                Instant cutoff = Instant.now().minus(chatReceiptsDays, ChronoUnit.DAYS);
                // ChatReadReceipt has readAt with @CreationTimestamp; treat nulls conservatively (do not delete)
                deletedReceipts = em.createQuery("delete from ChatReadReceipt r where r.readAt is not null and r.readAt < :cutoff")
                        .setParameter("cutoff", cutoff)
                        .executeUpdate();
            }
        } catch (Exception e) {
            log.warn("Failed to cleanup ChatReadReceipt: {}", e.getMessage());
        }

        try {
            if (notificationsDays > 0) {
                Instant cutoff = Instant.now().minus(notificationsDays, ChronoUnit.DAYS);
                // Delete only read notifications older than cutoff; prefer readAt, fall back to updatedAt when necessary
                deletedNotifs = em.createQuery(
                                "delete from Notification n " +
                                        "where n.read = true and " +
                                        "((n.readAt is not null and n.readAt < :cutoff) " +
                                        "or (n.readAt is null and n.updatedAt is not null and n.updatedAt < :cutoff))")
                        .setParameter("cutoff", cutoff)
                        .executeUpdate();
            }
        } catch (Exception e) {
            log.warn("Failed to cleanup Notification: {}", e.getMessage());
        }

        long durationNs = System.nanoTime() - startNs;
        meterRegistry.timer("retention.cleanup.duration").record(durationNs, TimeUnit.NANOSECONDS);
        if (deletedMsgs > 0) meterRegistry.counter("retention.cleanup.deleted", "type", "chat_messages").increment(deletedMsgs);
        if (deletedReceipts > 0) meterRegistry.counter("retention.cleanup.deleted", "type", "read_receipts").increment(deletedReceipts);
        if (deletedNotifs > 0) meterRegistry.counter("retention.cleanup.deleted", "type", "notifications").increment(deletedNotifs);

        lastRun.set(System.currentTimeMillis());

        if (deletedMsgs > 0 || deletedReceipts > 0 || deletedNotifs > 0) {
            log.info("Retention cleanup: deleted {} chat message(s), {} read receipt(s), {} notification(s)",
                    deletedMsgs, deletedReceipts, deletedNotifs);
        }
    }
}
