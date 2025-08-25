package com.bmessi.pickupsportsapp.service.push;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Feature-flagged Web Push client stub.
 * This attempts an HTTP request to the push endpoint and maps common statuses
 * to GONE/NOT_FOUND vs transient. In production, replace with a proper Web Push
 * library that handles VAPID and payload encryption.
 */
@Component
@ConditionalOnProperty(name = "push.webpush.enabled", havingValue = "true")
public class HttpWebPushClient implements WebPushClient {

    private static final Logger log = LoggerFactory.getLogger(HttpWebPushClient.class);
    private final HttpClient client = HttpClient.newHttpClient();

    @Override
    public Result send(String endpoint, String payloadJson, String vapidPublic, String vapidPrivate, String subject) {
        try {
            if (endpoint == null || endpoint.isBlank()) {
                return Result.transientError("missing endpoint");
            }
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("TTL", "60")
                    .POST(HttpRequest.BodyPublishers.ofString(payloadJson == null ? "" : payloadJson))
                    .build();
            HttpResponse<Void> resp = client.send(req, HttpResponse.BodyHandlers.discarding());
            int status = resp.statusCode();
            if (status >= 200 && status < 300) return Result.ok();
            if (status == 404) return Result.notFound("not_found");
            if (status == 410) return Result.gone("gone");
            return Result.transientError("status=" + status);
        } catch (Exception e) {
            log.debug("WebPush send error: {}", e.toString());
            return Result.transientError(e.getClass().getSimpleName());
        }
    }
}
