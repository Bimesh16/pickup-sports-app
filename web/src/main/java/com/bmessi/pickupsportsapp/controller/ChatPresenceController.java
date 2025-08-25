package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.chat.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.security.Principal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/games/{gameId}/presence")
public class ChatPresenceController {

    private final ChatPresenceService presence;

    @PostMapping("/heartbeat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> heartbeat(@PathVariable Long gameId, Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ResponseEntity.status(401).headers(noStore()).body(Map.of(
                    "error", "unauthorized",
                    "message", "Authentication required",
                    "timestamp", System.currentTimeMillis()
            ));
        }
        var beat = presence.heartbeat(gameId, principal.getName());
        return ResponseEntity.ok()
                .headers(noStore())
                .body(Map.of(
                        "timestamp", beat.timestamp(),
                        "ttlSeconds", beat.ttlSeconds(),
                        "count", beat.count()
                ));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> list(@PathVariable Long gameId,
                                                    @RequestParam(defaultValue = "false") boolean includeUsers) {
        var info = presence.list(gameId, includeUsers);
        return ResponseEntity.ok()
                .headers(noStore())
                .body(includeUsers
                        ? Map.of("count", info.count(), "users", info.users())
                        : Map.of("count", info.count()));
    }

    
}
