package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ReadStatusDTO;
import com.bmessi.pickupsportsapp.service.ReadReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/games/{gameId}/chat")
public class ReadStatusController {

    private final ReadReceiptService readReceiptService;

    @GetMapping("/read-status")
    public org.springframework.http.ResponseEntity<ReadStatusDTO> status(@PathVariable Long gameId, @RequestParam Long messageId) {
        if (messageId == null || messageId <= 0) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "messageId must be positive");
        }
        ReadStatusDTO body = readReceiptService.status(gameId, messageId);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Cache-Control", "no-store");
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(body);
    }
}
