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

    // GET /games/{gameId}/chat/latest?limit=50
    @GetMapping(path = "/games/{gameId}/chat/latest", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ChatMessageDTO> latest(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return chatService.latest(gameId, limit);
    }

    // GET /games/{gameId}/chat/since?after=2025-08-19T22:10:00Z&limit=100
    @GetMapping(path = "/games/{gameId}/chat/since", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ChatMessageDTO> since(
            @PathVariable Long gameId,
            @RequestParam("after") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant after,
            @RequestParam(defaultValue = "100") int limit
    ) {
        return chatService.since(gameId, after, limit);
    }

}
