package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.chat.ChatMessagePublisher;
import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatMessagePublisher publisher;

    // Client sends to: /app/games/{gameId}/chat
    // Server broadcasts on: /topic/games/{gameId}/chat
    @MessageMapping("/games/{gameId}/chat")
    public void handle(@DestinationVariable Long gameId, @Payload ChatMessageDTO msg) {
        if (msg.getSentAt() == null) {
            msg.setSentAt(Instant.now());
        }
        // Persist
        chatService.record(gameId, msg);

        // Fan-out (Redis if enabled; else local)
        String destination = "/topic/games/" + gameId + "/chat";
        publisher.publish(destination, msg);
    }
}
