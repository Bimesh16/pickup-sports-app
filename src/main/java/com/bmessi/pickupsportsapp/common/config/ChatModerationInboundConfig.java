package com.bmessi.pickupsportsapp.common.config;

import com.bmessi.pickupsportsapp.service.chat.ChatModerationInboundInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@RequiredArgsConstructor
public class ChatModerationInboundConfig implements WebSocketMessageBrokerConfigurer {

    private final ChatModerationInboundInterceptor moderationInterceptor;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(moderationInterceptor);
    }
}
