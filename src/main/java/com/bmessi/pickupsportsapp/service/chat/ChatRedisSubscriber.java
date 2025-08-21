package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.model.OutboundMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.SmartLifecycle;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "chat.redis", name = "enabled", havingValue = "true")
public class ChatRedisSubscriber implements MessageListener, SmartLifecycle {

    private final RedisMessageListenerContainer container; // comes from RedisConfig
    private final ObjectMapper mapper;                     // Spring Boot auto-configured
    private final SimpMessagingTemplate broker;

    private volatile boolean running = false;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String json = new String(message.getBody(), StandardCharsets.UTF_8);
            OutboundMessage out = mapper.readValue(json, OutboundMessage.class);
            broker.convertAndSend(out.getDestination(), out.getPayload());
        } catch (Exception e) {
            log.warn("Failed to consume chat message from Redis", e);
        }
    }

    @Override
    public void start() {
        container.addMessageListener(this, new PatternTopic("chat-messages"));
        running = true;
        log.info("ChatRedisSubscriber started (subscribed to 'chat-messages').");
    }

    @Override
    public void stop() {
        container.removeMessageListener(this);
        running = false;
        log.info("ChatRedisSubscriber stopped.");
    }

    @Override
    public boolean isRunning() {
        return running;
    }
}
