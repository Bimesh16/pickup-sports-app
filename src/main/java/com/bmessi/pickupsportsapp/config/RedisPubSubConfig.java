package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.model.OutboundMessage; // <-- updated import
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.messaging.simp.SimpMessagingTemplate;

/**
 * Subscribes to Redis only when chat.redis.enabled=true.
 * Forwards Pub/Sub messages to WebSocket clients on THIS node.
 */
@Configuration
@ConditionalOnProperty(prefix = "chat.redis", name = "enabled", havingValue = "true")
public class RedisPubSubConfig {

    @Bean
    public MessageListenerAdapter chatRedisListenerAdapter(
            SimpMessagingTemplate messagingTemplate,
            ObjectMapper objectMapper
    ) {
        Object receiver = new Object() {
            @SuppressWarnings("unused")
            public void handleMessage(String messageJson) throws Exception {
                OutboundMessage outbound = objectMapper.readValue(messageJson, OutboundMessage.class);
                messagingTemplate.convertAndSend(outbound.getDestination(), outbound.getPayload());
            }
        };
        return new MessageListenerAdapter(receiver, "handleMessage");
    }

    @Bean
    public RedisMessageListenerContainer redisContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter chatRedisListenerAdapter,
            @Value("${chat.redis.channel:chat-messages}") String channel
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(chatRedisListenerAdapter, new PatternTopic(channel));
        return container;
    }
}
