package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.chat.ChatMessagePublisher;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatMessagePublisher publisher;
    private final GameAccessService gameAccessService;
    private final com.bmessi.pickupsportsapp.service.chat.ProfanityFilterService profanityFilter;

    // Client sends to: /app/games/{gameId}/chat
    // Server broadcasts on: /topic/games/{gameId}/chat
    @MessageMapping("/games/{gameId}/chat")
    @RateLimiter(name = "chat")
    @Timed(value = "chat.send", description = "Time to handle inbound chat message")
    public void handle(@DestinationVariable Long gameId, @Payload ChatMessageDTO msg, Principal principal) {
        // Require authenticated user
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new org.springframework.messaging.MessagingException("Authentication required");
        }
        String username = principal.getName();

        // Enforce access (creator or participant)
        boolean allowed = gameAccessService.canAccessGame(gameId, username);
        if (!allowed) {
            throw new org.springframework.messaging.MessagingException("Access denied to this game's chat");
        }

        // Normalize payload: sender, timestamp
        if (msg.getSender() == null || msg.getSender().isBlank()) {
            msg.setSender(username);
        }
        if (msg.getSentAt() == null) {
            msg.setSentAt(Instant.now());
        }

        // Sanitize clientId
        if (msg.getClientId() != null) {
            String cid = msg.getClientId().trim();
            if (cid.length() > 64) cid = cid.substring(0, 64);
            // allow alphanum, dash, underscore only
            cid = cid.replaceAll("[^A-Za-z0-9_-]", "");
            msg.setClientId(cid.isEmpty() ? null : cid);
        }

        // Sanitize and validate content
        String content = (msg.getContent() == null) ? "" : msg.getContent();
        content = content.trim()
                .replace("\r", "")
                .replaceAll("\\p{Cntrl}&&[^\n\t]", ""); // remove control chars except LF/TAB
        if (content.isEmpty()) {
            throw new org.springframework.messaging.MessagingException("Message content must not be blank");
        }
        if (content.length() > 1000) {
            content = content.substring(0, 1000);
        }
        if (profanityFilter.isEnabled()) {
            if (profanityFilter.shouldReject() && profanityFilter.containsProfanity(content)) {
                throw new org.springframework.messaging.MessagingException("Message rejected by moderation policy");
            }
            content = profanityFilter.sanitize(content);
        }
        msg.setContent(content);

        // Persist and get the canonical record (includes DB messageId, normalized fields, etc.)
        ChatMessageDTO saved = chatService.record(gameId, msg);

        // Fan-out (Redis-backed or local depending on your config)
        String destination = "/topic/games/" + gameId + "/chat";
        publisher.publish(destination, saved);
    }
}
