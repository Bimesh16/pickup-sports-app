package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.chat.ChatMessagePublisher;
import com.bmessi.pickupsportsapp.dto.ReadReceiptDTO;
import com.bmessi.pickupsportsapp.dto.ReadStatusDTO;
import com.bmessi.pickupsportsapp.dto.TypingEventDTO;
import com.bmessi.pickupsportsapp.service.ReadReceiptService;
import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatSignalsController {

    private final ChatMessagePublisher publisher;
    private final ReadReceiptService readReceiptService;
    private final GameAccessService gameAccessService;

    // Client SENDs: /app/games/{gameId}/typing   { sender, typing }
    // Server BROADCASTs: /topic/games/{gameId}/typing
    @MessageMapping("/games/{gameId}/typing")
    @RateLimiter(name = "chat")
    @Timed(value = "chat.typing", description = "Time to handle typing signals")
    public void typing(@DestinationVariable Long gameId, @Payload TypingEventDTO ev, Principal p) {
        if (p == null || p.getName() == null || p.getName().isBlank()) {
            throw new MessagingException("Authentication required");
        }
        String user = p.getName();
        if (!gameAccessService.canAccessGame(gameId, user)) {
            throw new MessagingException("Access denied to this game's chat");
        }

        if (ev.getAt() == null) ev.setAt(Instant.now());
        if (ev.getSender() == null) ev.setSender(user);

        String destination = "/topic/games/" + gameId + "/typing";
        publisher.publish(destination, ev);
    }

    // Client SENDs: /app/games/{gameId}/read   { messageId, reader? }
    // Server BROADCASTs: /topic/games/{gameId}/read   { messageId, count, readers[] }
    @MessageMapping("/games/{gameId}/read")
    @RateLimiter(name = "chat")
    @Timed(value = "chat.readReceipt", description = "Time to handle read receipts")
    public void read(@DestinationVariable Long gameId, @Payload ReadReceiptDTO dto, Principal p) {
        if (p == null || p.getName() == null || p.getName().isBlank()) {
            throw new MessagingException("Authentication required");
        }
        String user = p.getName();
        if (!gameAccessService.canAccessGame(gameId, user)) {
            throw new MessagingException("Access denied to this game's chat");
        }

        if (dto.getReader() == null) dto.setReader(user);
        if (dto.getReadAt() == null) dto.setReadAt(Instant.now());

        ReadStatusDTO status = readReceiptService.markRead(gameId, dto.getMessageId(), dto.getReader(), dto.getReadAt());
        String destination = "/topic/games/" + gameId + "/read";
        publisher.publish(destination, status);
    }
}
