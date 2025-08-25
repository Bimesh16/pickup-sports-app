package com.bmessi.pickupsportsapp.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple sliding-window burst limiter per user for inbound STOMP SEND frames.
 * Works alongside the global ChatRateLimitInterceptor (per destination/channel).
 */
@Component
public class ChatBurstLimitInterceptor implements ChannelInterceptor {

    private final int maxPerWindow;
    private final long windowMillis;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    private static final class Window {
        volatile long start = System.currentTimeMillis();
        final AtomicInteger count = new AtomicInteger(0);
    }

    private final Map<String, Window> buckets = new ConcurrentHashMap<>();

    public ChatBurstLimitInterceptor(
            @Value("${chat.ratelimit.userBurst:20}") int maxPerWindow,
            @Value("${chat.ratelimit.userBurstWindowMillis:10000}") long windowMillis,
            io.micrometer.core.instrument.MeterRegistry meterRegistry
    ) {
        this.maxPerWindow = Math.max(1, maxPerWindow);
        this.windowMillis = Math.max(1000L, windowMillis);
        this.meterRegistry = meterRegistry;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null || acc.getCommand() == null) return message;

        if (StompCommand.SEND.equals(acc.getCommand())) {
            Principal p = acc.getUser();
            String user = (p != null) ? p.getName() : null;
            if (user == null || user.isBlank()) return message;

            String key = user.toLowerCase();
            Window w = buckets.computeIfAbsent(key, k -> new Window());

            long now = System.currentTimeMillis();
            if (now - w.start >= windowMillis) {
                w.start = now;
                w.count.set(0);
            }
            int c = w.count.incrementAndGet();
            if (c > maxPerWindow) {
                String dest = acc.getDestination() == null ? "unknown" : acc.getDestination();
                try { meterRegistry.counter("chat.burst.denied", "destination", dest).increment(); } catch (Exception ignore) {}
                throw new org.springframework.messaging.MessagingException("rate_limit_burst_exceeded");
            }
        }
        return message;
    }
}
