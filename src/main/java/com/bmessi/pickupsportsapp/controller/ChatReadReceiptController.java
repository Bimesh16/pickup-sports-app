package com.bmessi.pickupsportsapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/games/{gameId}/chat")
@RequiredArgsConstructor
public class ChatReadReceiptController {

    private final SimpMessagingTemplate broker;

    @PostMapping("/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.StatusResponse> read(@PathVariable Long gameId,
                                                                                   @RequestBody Map<String, Object> body,
                                                                                   Principal principal) {
        String user = principal != null ? principal.getName() : "unknown";
        Object last = body != null ? body.get("lastRead") : null;
        broker.convertAndSend("/topic/games/" + gameId + "/read", Map.of(
                "user", user,
                "lastRead", last,
                "ts", Instant.now().toEpochMilli()
        ));
        HttpHeaders headers = com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
        return ResponseEntity.ok().headers(headers).body(new com.bmessi.pickupsportsapp.dto.api.StatusResponse("ok"));
    }
}
