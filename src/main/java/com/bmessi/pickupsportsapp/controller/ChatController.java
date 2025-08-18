package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Handles chat messages sent over WebSocket/STOMP.  Clients send
 * messages to /app/games/{gameId}/chat; they are broadcast to
 * /topic/games/{gameId}/chat.
 */
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/games/{gameId}/chat")
    public void sendGameChat(
            @DestinationVariable Long gameId,
            ChatMessage message,
            Principal principal
    ) {
        // Optional: validate that the principal corresponds to message.sender
        // and that they are a participant of the game (omitted for brevity).

        // Broadcast the message to all subscribers of this topic
        messagingTemplate.convertAndSend(
                "/topic/games/" + gameId + "/chat",
                message
        );
    }
}
