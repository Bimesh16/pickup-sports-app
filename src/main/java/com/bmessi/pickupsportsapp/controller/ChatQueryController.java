package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/games/{gameId}/chat")
public class ChatQueryController {

    private final com.bmessi.pickupsportsapp.service.chat.ChatService chatService;

    @GetMapping("/latest")
    public List<ChatMessageDTO> latest(
            @PathVariable Long gameId, @RequestParam(defaultValue = "50") int limit) {
        return chatService.latest(gameId, limit);
    }

    @GetMapping("/since")
    public List<com.bmessi.pickupsportsapp.dto.ChatMessageDTO> since(
            @PathVariable Long gameId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.Instant after,
            @RequestParam(defaultValue = "100") int limit) {
        return chatService.since(gameId, after, limit);
    }
}
