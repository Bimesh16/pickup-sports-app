package com.bmessi.pickupsportsapp.common.config;

import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.NotificationRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class ChatNotificationRetentionScheduler {

    private static final Logger log = LoggerFactory.getLogger(ChatNotificationRetentionScheduler.class);

    private final ChatMessageRepository chatRepo;
    private final NotificationRepository notificationRepo;
    private final MeterRegistry meterRegistry;

    // Configurable via properties; defaults safe for production
    @org.springframework.beans.factory.annotation.Value("${retention.chat.days:30}")
    private int chatDays;

    @org.springframework.beans.factory.annotation.Value("${retention.notifications.days:90}")
    private int notificationDays;

    // Run daily at 03:20 server time
    @Scheduled(cron = "${retention.cleanup.cron:0 20 3 * * *}")
    @Transactional
    public void cleanup() {
        Instant chatCutoff = Instant.now().minus(Math.max(1, chatDays), ChronoUnit.DAYS);
        Instant notifCutoff = Instant.now().minus(Math.max(7, notificationDays), ChronoUnit.DAYS);

        int chatDeleted = 0;
        int notifDeleted = 0;
        try {
            chatDeleted = chatRepo.deleteBySentAtBefore(chatCutoff);
            meterRegistry.counter("retention.deleted", "type", "chat").increment(chatDeleted);
        } catch (Exception e) {
            log.warn("Chat retention cleanup failed: {}", e.getMessage(), e);
            meterRegistry.counter("retention.failed", "type", "chat").increment();
        }
        try {
            notifDeleted = notificationRepo.deleteByReadTrueAndCreatedAtBefore(notifCutoff);
            meterRegistry.counter("retention.deleted", "type", "notification").increment(notifDeleted);
        } catch (Exception e) {
            log.warn("Notification retention cleanup failed: {}", e.getMessage(), e);
            meterRegistry.counter("retention.failed", "type", "notification").increment();
        }
        log.info("Retention cleanup done: chatDeleted={}, notifDeleted={}, chatCutoff={}, notifCutoff={}",
                chatDeleted, notifDeleted, chatCutoff, notifCutoff);
    }
}
