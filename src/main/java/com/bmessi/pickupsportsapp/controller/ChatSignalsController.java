package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.ChatMessagePublisher;
import com.bmessi.pickupsportsapp.dto.ReadReceiptDTO;
import com.bmessi.pickupsportsapp.dto.ReadStatusDTO;
import com.bmessi.pickupsportsapp.dto.TypingEventDTO;
import com.bmessi.pickupsportsapp.service.ReadReceiptService;
import lombok.RequiredArgsConstructor;
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

    // Client SENDs: /app/games/{gameId}/typing   { sender, typing }
    // Server BROADCASTs: /topic/games/{gameId}/typing
    @MessageMapping("/games/{gameId}/typing")
    public void typing(@DestinationVariable Long gameId, @Payload TypingEventDTO ev, Principal p) {
        if (ev.getAt() == null) ev.setAt(Instant.now());
        if (ev.getSender() == null && p != null) ev.setSender(p.getName());
        String destination = "/topic/games/" + gameId + "/typing";
        publisher.publish(destination, ev);
    }

    // Client SENDs: /app/games/{gameId}/read   { messageId, reader? }
    // Server BROADCASTs: /topic/games/{gameId}/read   { messageId, count, readers[] }
    @MessageMapping("/games/{gameId}/read")
    public void read(@DestinationVariable Long gameId, @Payload ReadReceiptDTO dto, Principal p) {
        if (dto.getReader() == null && p != null) dto.setReader(p.getName());
        ReadStatusDTO status = readReceiptService.markRead(gameId, dto.getMessageId(), dto.getReader(), dto.getReadAt());
        String destination = "/topic/games/" + gameId + "/read";
        publisher.publish(destination, status);
    }
}
