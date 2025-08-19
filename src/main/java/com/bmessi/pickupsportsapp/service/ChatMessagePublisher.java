package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.model.OutboundMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatMessagePublisher {

    private static final Logger log = LoggerFactory.getLogger(ChatMessagePublisher.class);

    private final StringRedisTemplate redisTemplate;   // may be null when Redis starter not present
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final boolean redisEnabled;
    private final String channel;

    public ChatMessagePublisher(
            StringRedisTemplate redisTemplate,        // Spring will inject if available
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate,
            @Value("${chat.redis.enabled:false}") boolean redisEnabled,
            @Value("${chat.redis.channel:chat-messages}") String channel) {

        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
        this.redisEnabled = redisEnabled;
        this.channel = channel;
    }

    public void publish(String destination, Object payload) {
        // If Redis disabled or not available, do local send to connected clients on this node.
        if (!redisEnabled || redisTemplate == null) {
            messagingTemplate.convertAndSend(destination, payload);
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(new OutboundMessage(destination, payload));
            redisTemplate.convertAndSend(channel, json);
        } catch (Exception e) {
            // Redis may be temporarily down — log and fall back to local send so chat still works on this node.
            log.warn("Redis publish failed; falling back to local send. reason={}", e.getMessage());
            messagingTemplate.convertAndSend(destination, payload);
        }
    }
}
