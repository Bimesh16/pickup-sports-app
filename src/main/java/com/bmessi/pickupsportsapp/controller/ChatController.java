package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    // Client sends to: /app/games/{gameId}/chat
    // Server broadcasts on: /topic/games/{gameId}/chat
    @MessageMapping("/games/{gameId}/chat")
    public void handle(@DestinationVariable Long gameId,
                       @Payload ChatMessageDTO msg) {
        if (msg.getSentAt() == null) {
            msg.setSentAt(Instant.now());
        }
        chatService.record(gameId, msg);

        // Explicitly send to the dynamic destination that matches the client subscription
        String destination = "/topic/games/" + gameId + "/chat";
        messagingTemplate.convertAndSend(destination, msg);
    }
}