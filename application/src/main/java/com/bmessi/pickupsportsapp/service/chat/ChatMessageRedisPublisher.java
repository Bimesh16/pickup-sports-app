package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.model.OutboundMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "chat.redis", name = "enabled", havingValue = "true")
public class ChatMessageRedisPublisher implements ChatMessagePublisher {

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;
    private final MeterRegistry meterRegistry;

    @Override
    public void publish(String destination, Object payload) {
        try {
            String json = mapper.writeValueAsString(new OutboundMessage(destination, payload));
            redis.convertAndSend("chat-messages", json);
            meterRegistry.counter("ws.publish.sent", "publisher", "redis", "destination", destination).increment();
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize outbound chat message for destination {}: {}", destination, e.getMessage());
            meterRegistry.counter("ws.publish.failed", "publisher", "redis", "destination", destination).increment();
        } catch (Exception e) {
            log.warn("Failed to publish chat message to Redis for destination {}: {}", destination, e.getMessage());
            meterRegistry.counter("ws.publish.failed", "publisher", "redis", "destination", destination).increment();
        }
    }
}
