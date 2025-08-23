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
    public org.springframework.http.ResponseEntity<List<ChatMessageDTO>> latest(
            @PathVariable Long gameId, @RequestParam(defaultValue = "50") int limit) {
        int eff = Math.max(1, Math.min(limit, 200));
        List<ChatMessageDTO> body = chatService.latest(gameId, eff);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Cache-Control", "no-store");
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/since")
    public org.springframework.http.ResponseEntity<java.util.List<com.bmessi.pickupsportsapp.dto.ChatMessageDTO>> since(
            @PathVariable Long gameId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.Instant after,
            @RequestParam(defaultValue = "100") int limit) {
        int eff = Math.max(1, Math.min(limit, 200));
        java.util.List<com.bmessi.pickupsportsapp.dto.ChatMessageDTO> body = chatService.since(gameId, after, eff);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Cache-Control", "no-store");
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }
}
