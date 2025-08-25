package com.bmessi.pickupsportsapp.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@ConditionalOnProperty(prefix = "chat.ratelimit", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ChatRateLimitInterceptor implements ChannelInterceptor {

    private final int limitPerSecond;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public ChatRateLimitInterceptor(@Value("${chat.ratelimit.perSecond:10}") int limitPerSecond) {
        this.limitPerSecond = Math.max(1, limitPerSecond);
    }

    static class Window {
        volatile long startMillis = System.currentTimeMillis();
        final AtomicInteger count = new AtomicInteger(0);
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null || acc.getCommand() != StompCommand.SEND) return message;

        String dest = acc.getDestination();
        if (dest == null || !dest.startsWith("/app/games/")) return message;

        String user = (acc.getUser() != null) ? acc.getUser().getName() : "anonymous";
        long now = System.currentTimeMillis();
        Window w = windows.computeIfAbsent(user, k -> new Window());

        synchronized (w) {
            if (now - w.startMillis >= 1000) {
                w.startMillis = now;
                w.count.set(0);
            }
            if (w.count.incrementAndGet() > limitPerSecond) {
                throw new MessagingException("Rate limit exceeded");
            }
        }
        return message;
    }
}
