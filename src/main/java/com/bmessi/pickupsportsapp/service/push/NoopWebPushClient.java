package com.bmessi.pickupsportsapp.service.push;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Default no-op client: logs delivery. Replace with a real Web Push sender
 * (e.g., library-backed) by providing another bean of WebPushClient.
 */
@Component
public class NoopWebPushClient implements WebPushClient {

    private static final Logger log = LoggerFactory.getLogger(NoopWebPushClient.class);

    @Override
    public Result send(String endpoint, String payloadJson, String vapidPublic, String vapidPrivate, String subject) {
        log.info("WebPush (noop) -> endpoint={} subject={} payload={}", endpoint, subject, payloadJson);
        // Simulate unsubscribe classification by endpoint suffix for testing
        if (endpoint != null && (endpoint.endsWith("/gone") || endpoint.contains("/gone"))) {
            return Result.gone("Endpoint gone");
        }
        if (endpoint != null && (endpoint.endsWith("/nf") || endpoint.contains("/nf"))) {
            return Result.notFound("Endpoint not found");
        }
        return Result.ok();
    }
}
