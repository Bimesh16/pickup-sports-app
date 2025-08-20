package com.bmessi.pickupsportsapp.config;

import org.jetbrains.annotations.NotNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
public class ChatInboundChannelConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketJwtAuthInterceptor jwtAuthInterceptor;
    private final WebSocketDestinationAuthInterceptor destinationAuthInterceptor;
    private final ChatRateLimitInterceptor chatRateLimitInterceptor; // optional

    public ChatInboundChannelConfig(WebSocketJwtAuthInterceptor jwtAuthInterceptor,
                                    WebSocketDestinationAuthInterceptor destinationAuthInterceptor,
                                    ChatRateLimitInterceptor chatRateLimitInterceptor) {
        this.jwtAuthInterceptor = jwtAuthInterceptor;
        this.destinationAuthInterceptor = destinationAuthInterceptor;
        this.chatRateLimitInterceptor = chatRateLimitInterceptor;
    }

    @Override
    public void configureClientInboundChannel(@NotNull ChannelRegistration registration) {
        if (chatRateLimitInterceptor != null) {
            registration.interceptors(jwtAuthInterceptor, destinationAuthInterceptor, chatRateLimitInterceptor);
        } else {
            registration.interceptors(jwtAuthInterceptor, destinationAuthInterceptor);
        }
    }
}
