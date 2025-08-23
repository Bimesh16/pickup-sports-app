package com.bmessi.pickupsportsapp.service.chat;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "chat.redis", name = "enabled", havingValue = "false", matchIfMissing = true)
public class ChatMessageLocalPublisher implements ChatMessagePublisher {

    private final SimpMessagingTemplate broker;
    private final MeterRegistry meterRegistry;

    @Override
    public void publish(String destination, Object payload) {
        try {
            broker.convertAndSend(destination, payload);
            meterRegistry.counter("ws.publish.sent", "publisher", "local", "destination", destination).increment();
        } catch (Exception e) {
            meterRegistry.counter("ws.publish.failed", "publisher", "local", "destination", destination).increment();
            throw e;
        }
    }
}
