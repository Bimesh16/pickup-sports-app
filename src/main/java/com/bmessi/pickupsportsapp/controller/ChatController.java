package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.ChatService;
import com.bmessi.pickupsportsapp.service.ChatMessagePublisher;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class ChatController {

    private final ChatService chatService;
    private final ChatMessagePublisher publisher;

    public ChatController(ChatService chatService, ChatMessagePublisher publisher) {
        this.chatService = chatService;
        this.publisher = publisher;
    }

    // Client sends to: /app/games/{gameId}/chat
    // Server broadcasts on: /topic/games/{gameId}/chat (now via Redis fan-out)
    @MessageMapping("/games/{gameId}/chat")
    public void handle(@DestinationVariable Long gameId,
                       @Payload ChatMessageDTO msg) {

        if (msg.getSentAt() == null) {
            msg.setSentAt(Instant.now());
        }

        // your existing persistence/buffer/etc.
        chatService.record(gameId, msg);

        // publish once; all nodes will forward to their connected clients
        String destination = "/topic/games/" + gameId + "/chat";
        publisher.publish(destination, msg);
    }
}
