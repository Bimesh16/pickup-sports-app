package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
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
    public org.springframework.http.ResponseEntity<List<ChatMessageDTO>> history(
            @PathVariable Long gameId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
            @RequestParam(defaultValue = "50") int limit
    ) {
        int eff = Math.max(1, Math.min(limit, 200));
        List<ChatMessageDTO> body = chatService.history(gameId, before, eff);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Cache-Control", "no-store");
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }

    // GET /games/{gameId}/chat/latest?limit=50
    @GetMapping(path = "/games/{gameId}/chat/latest", produces = MediaType.APPLICATION_JSON_VALUE)
    public org.springframework.http.ResponseEntity<List<ChatMessageDTO>> latest(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        int eff = Math.max(1, Math.min(limit, 200));
        List<ChatMessageDTO> body = chatService.latest(gameId, eff);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Cache-Control", "no-store");
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }

    // GET /games/{gameId}/chat/since?after=2025-08-19T22:10:00Z&limit=100
    @GetMapping(path = "/games/{gameId}/chat/since", produces = MediaType.APPLICATION_JSON_VALUE)
    public org.springframework.http.ResponseEntity<List<ChatMessageDTO>> since(
            @PathVariable Long gameId,
            @RequestParam("after") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant after,
            @RequestParam(defaultValue = "100") int limit
    ) {
        int eff = Math.max(1, Math.min(limit, 200));
        List<ChatMessageDTO> body = chatService.since(gameId, after, eff);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Cache-Control", "no-store");
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }

}
