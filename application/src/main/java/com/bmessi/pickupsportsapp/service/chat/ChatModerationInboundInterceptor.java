package com.bmessi.pickupsportsapp.service.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ChatModerationInboundInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(ChatModerationInboundInterceptor.class);
    private static final Pattern GAME_ID_PATTERN = Pattern.compile(".*/games/(\\d+)/chat.*");

    private final ChatModerationService moderation;

    public ChatModerationInboundInterceptor(ChatModerationService moderation) {
        this.moderation = moderation;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = StompHeaderAccessor.wrap(message);
        StompCommand cmd = acc.getCommand();
        if (cmd == null) return message;

        String dest = acc.getDestination();
        if (dest == null) return message;

        // Enforce for SEND to /app/games/{id}/chat and SUBSCRIBE to /topic/games/{id}/chat
        boolean sendToChat = (cmd == StompCommand.SEND) && dest.startsWith("/app/") && dest.contains("/games/") && dest.contains("/chat");
        boolean subscribeToChat = (cmd == StompCommand.SUBSCRIBE) && dest.startsWith("/topic/") && dest.contains("/games/") && dest.contains("/chat");
        if (!sendToChat && !subscribeToChat) {
            return message;
        }

        Long gameId = extractGameId(dest);
        if (gameId == null) {
            return message;
        }

        Principal user = acc.getUser();
        String username = user != null ? user.getName() : null;
        if (username == null || username.isBlank()) {
            throw new AccessDeniedException("unauthenticated");
        }

        // Kicked users cannot subscribe or send
        if (moderation.isKicked(gameId, username)) {
            log.debug("Blocked kicked user {} from {}", username, dest);
            throw new AccessDeniedException("kicked");
        }

        // Muted users cannot send messages
        if (sendToChat && moderation.isMuted(gameId, username)) {
            log.debug("Blocked muted user {} from sending to {}", username, dest);
            throw new AccessDeniedException("muted");
        }

        return message;
    }

    private static Long extractGameId(String destination) {
        Matcher m = GAME_ID_PATTERN.matcher(destination);
        if (m.matches()) {
            try {
                return Long.parseLong(m.group(1));
            } catch (NumberFormatException ignore) {
                return null;
            }
        }
        return null;
    }
}
