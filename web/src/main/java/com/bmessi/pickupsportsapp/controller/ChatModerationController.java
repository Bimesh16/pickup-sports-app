package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.chat.ChatModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/games/{gameId}/moderation")
public class ChatModerationController {

    private final ChatModerationService moderation;

    // ----- Mutes -----
    @PostMapping("/mute/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> mute(@PathVariable Long gameId, @PathVariable String username) {
        moderation.mute(gameId, username);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Muted"));
    }

    @DeleteMapping("/mute/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> unmute(@PathVariable Long gameId, @PathVariable String username) {
        moderation.unmute(gameId, username);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Unmuted"));
    }

    @GetMapping("/mutes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UserListResponse> listMutes(@PathVariable Long gameId) {
        List<String> users = moderation.listMutes(gameId);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.UserListResponse(users.size(), users));
    }

    // ----- Kicks -----
    @PostMapping("/kick/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> kick(@PathVariable Long gameId, @PathVariable String username) {
        moderation.kick(gameId, username);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Kicked"));
    }

    @DeleteMapping("/kick/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> unkick(@PathVariable Long gameId, @PathVariable String username) {
        moderation.unkick(gameId, username);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Unkicked"));
    }

    @GetMapping("/kicks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.UserListResponse> listKicks(@PathVariable Long gameId) {
        List<String> users = moderation.listKicks(gameId);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.UserListResponse(users.size(), users));
    }

    
}
