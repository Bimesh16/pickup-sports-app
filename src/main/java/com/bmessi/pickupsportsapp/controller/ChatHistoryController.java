package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatHistoryController {

    private final ChatService chatService;

    // GET /games/{gameId}/chat/history?before=2025-08-19T20:00:00Z&limit=50
    @GetMapping(
            path = "/games/{gameId}/chat/history",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public List<ChatMessageDTO> history(
            @PathVariable Long gameId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return chatService.history(gameId, before, limit);
    }
}
