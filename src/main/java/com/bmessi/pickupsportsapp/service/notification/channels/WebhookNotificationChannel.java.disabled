package com.bmessi.pickupsportsapp.service.notification.channels;

import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.service.notification.NotificationChannelService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Webhook notification channel for integrating with external systems.
 * 
 * This allows notifications to be sent to external APIs or services,
 * enabling integrations with:
 * - Slack
 * - Discord
 * - Microsoft Teams
 * - Custom integrations
 * - Analytics platforms
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebhookNotificationChannel implements NotificationChannel {

    private final MeterRegistry meterRegistry;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @Value("${app.webhook.enabled:false}")
    private boolean webhookEnabled;

    @Value("${app.webhook.url:}")
    private String webhookUrl;

    @Value("${app.webhook.secret:}")
    private String webhookSecret;

    @Value("${app.webhook.timeout:5000}")
    private int webhookTimeoutMs;

    @Override
    public boolean deliver(EnhancedNotification notification) {
        if (!webhookEnabled) {
            log.debug("Webhook notifications disabled, skipping notification {}", notification.getId());
            return false;
        }

        try {
            // Create webhook payload
            Map<String, Object> payload = createWebhookPayload(notification);
            
            // Send webhook
            boolean sent = sendWebhook(payload);
            
            if (sent) {
                meterRegistry.counter("notifications.webhook.sent").increment();
                log.debug("Sent webhook notification {} for user {}", 
                    notification.getId(), notification.getUser().getUsername());
            } else {
                meterRegistry.counter("notifications.webhook.failed").increment();
            }

            return sent;

        } catch (Exception e) {
            log.error("Failed to send webhook notification {}: {}", notification.getId(), e.getMessage(), e);
            meterRegistry.counter("notifications.webhook.failed").increment();
            return false;
        }
    }

    @Override
    public boolean isAvailable() {
        return webhookEnabled && 
               webhookUrl != null && 
               !webhookUrl.isEmpty();
    }

    @Override
    public NotificationChannelService.ChannelStatus getHealthStatus() {
        if (!webhookEnabled) {
            return NotificationChannelService.ChannelStatus.unavailable("Webhook notifications disabled");
        }

        if (webhookUrl == null || webhookUrl.isEmpty()) {
            return NotificationChannelService.ChannelStatus.unavailable("Webhook URL not configured");
        }

        try {
            // Test webhook endpoint connectivity
            ResponseEntity<String> response = restTemplate.getForEntity(webhookUrl, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return NotificationChannelService.ChannelStatus.healthy("Webhook endpoint accessible");
            } else {
                return NotificationChannelService.ChannelStatus.unhealthy(
                    "Webhook endpoint returned " + response.getStatusCode());
            }
        } catch (Exception e) {
            return NotificationChannelService.ChannelStatus.unhealthy(
                "Webhook endpoint unreachable: " + e.getMessage());
        }
    }

    /**
     * Send webhook HTTP request.
     */
    private boolean sendWebhook(Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("User-Agent", "PickupSports-Webhook/1.0");
            
            // Add signature for security if secret is configured
            if (webhookSecret != null && !webhookSecret.isEmpty()) {
                String signature = createSignature(payload);
                headers.set("X-Webhook-Signature", signature);
            }
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                webhookUrl, 
                HttpMethod.POST, 
                entity, 
                String.class
            );
            
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            log.error("Failed to send webhook: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Create webhook payload.
     */
    private Map<String, Object> createWebhookPayload(EnhancedNotification notification) {
        Map<String, Object> payload = new HashMap<>();
        
        // Basic notification info
        payload.put("id", notification.getId());
        payload.put("eventType", notification.getEventType());
        payload.put("title", notification.getTitle());
        payload.put("message", notification.getMessage());
        payload.put("priority", notification.getPriority().toString());
        payload.put("channel", notification.getChannel().toString());
        payload.put("createdAt", notification.getCreatedAt().toString());
        
        // User info (limited for privacy)
        Map<String, Object> user = new HashMap<>();
        user.put("username", notification.getUser().getUsername());
        user.put("id", notification.getUser().getId());
        payload.put("user", user);
        
        // Optional fields
        if (notification.getImageUrl() != null) {
            payload.put("imageUrl", notification.getImageUrl());
        }
        
        if (notification.getClickUrl() != null) {
            payload.put("clickUrl", notification.getClickUrl());
        }
        
        if (notification.getMetadata() != null) {
            try {
                Map<String, Object> metadata = objectMapper.readValue(
                    notification.getMetadata(), 
                    Map.class
                );
                payload.put("metadata", metadata);
            } catch (Exception e) {
                log.warn("Failed to parse notification metadata: {}", e.getMessage());
            }
        }
        
        // Webhook metadata
        payload.put("webhook", Map.of(
            "timestamp", Instant.now().toString(),
            "version", "1.0",
            "source", "pickup-sports-app"
        ));
        
        return payload;
    }

    /**
     * Create HMAC signature for webhook security.
     */
    private String createSignature(Map<String, Object> payload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            
            // Create HMAC-SHA256 signature
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(
                webhookSecret.getBytes(), "HmacSHA256");
            mac.init(keySpec);
            
            byte[] hash = mac.doFinal(jsonPayload.getBytes());
            
            // Convert to hex
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return "sha256=" + hexString.toString();
            
        } catch (Exception e) {
            log.error("Failed to create webhook signature: {}", e.getMessage(), e);
            return "";
        }
    }
}