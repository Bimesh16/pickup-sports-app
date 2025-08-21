package com.bmessi.pickupsportsapp.service.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "chat.redis", name = "enabled", havingValue = "false", matchIfMissing = true)
public class ChatMessageLocalPublisher implements ChatMessagePublisher {

    private final SimpMessagingTemplate broker;

    @Override
    public void publish(String destination, Object payload) {
        broker.convertAndSend(destination, payload);
    }
}
