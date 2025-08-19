package com.bmessi.pickupsportsapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // Dev-safe: allow your local origins (8080, 8000, IntelliJ preview, etc.)
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Client sends to /app/...
        registry.setApplicationDestinationPrefixes("/app");
        // Server broadcasts on /topic/...
        registry.enableSimpleBroker("/topic");
    }
}
