package com.bmessi.pickupsportsapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
public class ChatInboundChannelConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketJwtAuthInterceptor jwtAuthInterceptor;
    private final ChatRateLimitInterceptor chatRateLimitInterceptor; // optional

    public ChatInboundChannelConfig(WebSocketJwtAuthInterceptor jwtAuthInterceptor,
                                    ChatRateLimitInterceptor chatRateLimitInterceptor) {
        this.jwtAuthInterceptor = jwtAuthInterceptor;
        this.chatRateLimitInterceptor = chatRateLimitInterceptor;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        if (chatRateLimitInterceptor != null) {
            registration.interceptors(jwtAuthInterceptor, chatRateLimitInterceptor);
        } else {
            registration.interceptors(jwtAuthInterceptor);
        }
    }
}
