package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.model.OutboundMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "chat.redis", name = "enabled", havingValue = "true")
public class ChatMessageRedisPublisher implements ChatMessagePublisher {

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    @Override
    public void publish(String destination, Object payload) {
        try {
            String json = mapper.writeValueAsString(new OutboundMessage(destination, payload));
            redis.convertAndSend("chat-messages", json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize outbound chat message", e);
        }
    }
}
