package com.bmessi.pickupsportsapp.common.config;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Only useful for native WebSocket testing (no SockJS).
 * Under the "native-ws-only" profile, this prevents plain HTTP GET /ws from
 * falling into MVC error/forward loops by returning 426 Upgrade Required.
 * With SockJS enabled, do NOT enable this profile to avoid any mapping conflict.
 */
@RestController
@Profile("native-ws-only")
class WebSocketNoUpgradeController {

    @GetMapping("/ws")
    public ResponseEntity<String> noUpgrade() {
        return ResponseEntity
                .status(HttpStatus.UPGRADE_REQUIRED)
                .body("{\"error\":\"upgrade_required\",\"message\":\"Use a WebSocket client: ws://host:port/ws\"}");
    }
}