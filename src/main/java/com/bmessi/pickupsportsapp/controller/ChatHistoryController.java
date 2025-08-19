package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    private final ChatService chatService;

    public ChatHistoryController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/games/{gameId}/history")
    public List<ChatMessageDTO> history(
            @PathVariable Long gameId,
            @RequestParam(required = false) String before,
            @RequestParam(defaultValue = "50") int limit) {

        Instant cutoff = (before == null || before.isBlank()) ? null : Instant.parse(before);
        return chatService.history(gameId, cutoff, limit);
    }
}
