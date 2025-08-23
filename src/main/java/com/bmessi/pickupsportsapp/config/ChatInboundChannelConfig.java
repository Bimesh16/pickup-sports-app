package com.bmessi.pickupsportsapp.config;

import org.jetbrains.annotations.NotNull;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class ChatInboundChannelConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketJwtAuthInterceptor jwtAuthInterceptor;
    private final WebSocketDestinationAuthInterceptor destinationAuthInterceptor;
    private final ChatRateLimitInterceptor chatRateLimitInterceptor; // optional
    private final MeterRegistry meterRegistry;

    public ChatInboundChannelConfig(WebSocketJwtAuthInterceptor jwtAuthInterceptor,
                                    WebSocketDestinationAuthInterceptor destinationAuthInterceptor,
                                    ChatRateLimitInterceptor chatRateLimitInterceptor,
                                    MeterRegistry meterRegistry) {
        this.jwtAuthInterceptor = jwtAuthInterceptor;
        this.destinationAuthInterceptor = destinationAuthInterceptor;
        this.chatRateLimitInterceptor = chatRateLimitInterceptor;
        this.meterRegistry = meterRegistry;
    }

    @Value("${chat.subscription.max:50}")
    private int subscriptionMax;


    @Bean
    public ChannelInterceptor stompMdcInterceptor() {
        return new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                String cid = MDC.get("cid");
                if (cid == null || cid.isBlank()) {
                    cid = UUID.randomUUID().toString();
                    MDC.put("cid", cid);
                }
                MessageHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, MessageHeaderAccessor.class);
                if (accessor != null && accessor.getHeader("X-Correlation-Id") == null) {
                    accessor.setHeader("X-Correlation-Id", cid);
                }
                return message;
            }

            @Override
            public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
                MDC.remove("cid");
            }
        };
    }


    /**
     * Limits active SUBSCRIBE frames per session (connection) to prevent abuse.
     * Decrements on UNSUBSCRIBE and cleans up on DISCONNECT.
     */
    @Bean
    public ChannelInterceptor subscriptionLimiterInterceptor() {
        final int limit = Math.max(1, subscriptionMax);
        return new ChannelInterceptor() {
            private final Map<String, AtomicInteger> subsPerSession = new ConcurrentHashMap<>();
            private final io.micrometer.core.instrument.Counter subscribeCounter =
                    meterRegistry.counter("ws.subscriptions.subscribe");
            private final io.micrometer.core.instrument.Counter unsubscribeCounter =
                    meterRegistry.counter("ws.subscriptions.unsubscribe");
            private final io.micrometer.core.instrument.Counter deniedCounter =
                    meterRegistry.counter("ws.subscriptions.denied");

            {
                // Register a gauge for total active subscriptions across sessions
                Gauge.builder("ws.subscriptions.active", subsPerSession,
                                m -> m.values().stream().mapToInt(AtomicInteger::get).sum())
                        .description("Total active WebSocket subscriptions")
                        .register(meterRegistry);
            }

            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (acc == null || acc.getCommand() == null) return message;

                String sessionId = acc.getSessionId();
                if (sessionId == null) return message;

                if (StompCommand.SUBSCRIBE.equals(acc.getCommand())) {
                    AtomicInteger counter = subsPerSession.computeIfAbsent(sessionId, k -> new AtomicInteger(0));
                    int current = counter.incrementAndGet();
                    subscribeCounter.increment();
                    if (current > limit) {
                        counter.decrementAndGet(); // rollback increment
                        deniedCounter.increment();
                        throw new org.springframework.messaging.MessagingException("Subscription limit exceeded");
                    }
                } else if (StompCommand.UNSUBSCRIBE.equals(acc.getCommand())) {
                    subsPerSession.computeIfPresent(sessionId, (k, c) -> {
                        int after = c.decrementAndGet();
                        unsubscribeCounter.increment();
                        return (after <= 0) ? null : c;
                    });
                } else if (StompCommand.DISCONNECT.equals(acc.getCommand())) {
                    subsPerSession.remove(sessionId);
                }
                return message;
            }
        };
    }

    @Override
    public void configureClientInboundChannel(@NotNull ChannelRegistration registration) {
        if (chatRateLimitInterceptor != null) {
            registration.interceptors(
                    jwtAuthInterceptor,
                    destinationAuthInterceptor,
                    chatRateLimitInterceptor,
                    stompMdcInterceptor(),
                    subscriptionLimiterInterceptor()
            );
        } else {
            registration.interceptors(
                    jwtAuthInterceptor,
                    destinationAuthInterceptor,
                    stompMdcInterceptor(),
                    subscriptionLimiterInterceptor()
            );
        }
    }
}
