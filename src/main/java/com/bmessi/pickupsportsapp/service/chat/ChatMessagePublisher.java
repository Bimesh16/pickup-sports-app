package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.model.OutboundMessage; // <-- updated import
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatMessagePublisher {

    private static final Logger log = LoggerFactory.getLogger(ChatMessagePublisher.class);

    private final StringRedisTemplate redisTemplate; // may be null when Redis not configured
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final boolean redisEnabled;
    private final String channel;

    public ChatMessagePublisher(
            ObjectProvider<StringRedisTemplate> redisTemplateProvider,
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate,
            @Value("${chat.redis.enabled:false}") boolean redisEnabled,
            @Value("${chat.redis.channel:chat-messages}") String channel
    ) {
        this.redisTemplate = redisTemplateProvider.getIfAvailable();
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
        this.redisEnabled = redisEnabled;
        this.channel = channel;
    }

    /**
     * Publish message to Redis channel when enabled; otherwise send locally.
     * Either way, clients connected to THIS node receive the message immediately.
     * With Redis enabled, ALL nodes receive it and forward to their clients.
     */
    public void publish(String destination, Object payload) {
        if (!redisEnabled || redisTemplate == null) {
            // Single-node mode
            messagingTemplate.convertAndSend(destination, payload);
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(new OutboundMessage(destination, payload));
            redisTemplate.convertAndSend(channel, json);
        } catch (Exception e) {
            // If Redis is flaky, don't drop messages for local users.
            log.warn("Redis publish failed; falling back to local send. reason={}", e.getMessage());
            messagingTemplate.convertAndSend(destination, payload);
        }
    }
}
