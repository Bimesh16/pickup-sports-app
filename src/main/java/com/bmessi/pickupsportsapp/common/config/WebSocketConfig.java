package com.bmessi.pickupsportsapp.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketJwtAuthInterceptor webSocketJwtAuthInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Enable SockJS so /ws/info and transport endpoints exist; no session cookie needed in dev
        var endpoint = registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
        endpoint.withSockJS().setSessionCookieNeeded(false);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");

        var simpleBroker = registry.enableSimpleBroker("/topic");
        simpleBroker.setHeartbeatValue(new long[]{10_000, 10_000}); // 10s send/receive
        simpleBroker.setTaskScheduler(wsBrokerTaskScheduler());

        registry.setPreservePublishOrder(true);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration
                .setMessageSizeLimit(128 * 1024)      // 128 KB
                .setSendTimeLimit(10_000)             // 10 seconds
                .setSendBufferSizeLimit(512 * 1024);  // 512 KB
    }

    @Bean
    public ThreadPoolTaskScheduler wsBrokerTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("ws-broker-");
        scheduler.initialize();
        return scheduler;
    }
}