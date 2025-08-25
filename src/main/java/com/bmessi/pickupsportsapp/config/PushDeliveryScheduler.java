package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.entity.PushOutbox;
import com.bmessi.pickupsportsapp.repository.PushOutboxRepository;
import com.bmessi.pickupsportsapp.repository.PushSubscriptionRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PushDeliveryScheduler {

    private static final Logger log = LoggerFactory.getLogger(PushDeliveryScheduler.class);

    private final PushOutboxRepository outbox;
    private final PushSubscriptionRepository subs;
    private final MeterRegistry meterRegistry;
    private final com.bmessi.pickupsportsapp.config.properties.VapidProperties vapid;
    private final com.bmessi.pickupsportsapp.config.properties.PushDeliveryProperties props;
    private final com.bmessi.pickupsportsapp.service.push.WebPushClient client;

    // Poll every minute by default
    @Scheduled(fixedDelayString = "${push.delivery.fixed-delay-ms:60000}")
    @Transactional
    public void flush() {
        List<PushOutbox> batch = outbox.findTop100ByStatusOrderByCreatedAtAsc(PushOutbox.Status.PENDING);
        if (batch.isEmpty()) return;

        for (PushOutbox row : batch) {
            try {
                // Respect nextAttemptAt for backoff
                if (row.getNextAttemptAt() != null && row.getNextAttemptAt().isAfter(Instant.now())) {
                    continue;
                }
                var list = subs.findByUser_Username(row.getUser().getUsername());
                if (list.isEmpty()) {
                    // Nothing to send to; mark sent for idempotency avoidance
                    markSent(row);
                    continue;
                }

                int delivered = 0;
                int gone = 0;
                int transientErr = 0;

                for (var s : list) {
                    var result = client.send(
                            s.getEndpoint(),
                            toJson(row),
                            vapid.getPublicKey(),
                            vapid.getPrivateKey(),
                            row.getTitle()
                    );
                    switch (result.code()) {
                        case OK -> {
                            delivered++;
                        }
                        case GONE, NOT_FOUND -> {
                            gone++;
                            try { subs.deleteByUser_UsernameAndEndpoint(row.getUser().getUsername(), s.getEndpoint()); } catch (Exception ignore) {}
                        }
                        case TRANSIENT_ERROR -> {
                            transientErr++;
                        }
                    }
                }

                if (delivered > 0) {
                    markSent(row);
                    meter("push.delivered", "ok");
                } else if (gone > 0 && transientErr == 0) {
                    // all gone/not found
                    markDead(row, "unsubscribed");
                    meter("push.dead", "unsubscribed");
                } else {
                    // retry with backoff
                    backoff(row, "transient");
                    meter("push.retry", "transient");
                }
            } catch (Exception e) {
                backoff(row, e.getClass().getSimpleName());
                log.warn("Push delivery failed: {}", e.getMessage(), e);
            }
        }
    }

    private void markSent(PushOutbox row) {
        row.setStatus(PushOutbox.Status.SENT);
        row.setSentAt(Instant.now());
        outbox.save(row);
    }

    private void markDead(PushOutbox row, String reason) {
        row.setStatus(PushOutbox.Status.FAILED);
        row.setDeadAt(Instant.now());
        row.setDeadReason(reason);
        outbox.save(row);
    }

    private void backoff(PushOutbox row, String reason) {
        int rc = row.getRetryCount() + 1;
        row.setRetryCount(rc);
        long base = Math.max(1000, props.getBaseBackoffMs());
        long max = Math.max(base, props.getMaxBackoffMs());
        long exp = Math.min(max, (long) (base * Math.pow(2, Math.min(rc, 10))));
        long jitter = (long) (Math.random() * (base / 2));
        row.setNextAttemptAt(Instant.now().plusMillis(exp + jitter));
        row.setError(reason);
        if (rc >= props.getMaxRetries()) {
            markDead(row, "max_retries");
        } else {
            outbox.save(row);
        }
    }

    private void meter(String name, String reason) {
        try { meterRegistry.counter(name, "reason", reason).increment(); } catch (Exception ignore) {}
    }

    private String toJson(PushOutbox row) {
        String title = row.getTitle() == null ? "" : row.getTitle();
        String body = row.getBody() == null ? "" : row.getBody();
        String link = row.getLink() == null ? "" : row.getLink();
        return "{\"title\":\"" + escape(title) + "\",\"body\":\"" + escape(body) + "\",\"link\":\"" + escape(link) + "\"}";
    }

    private String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
