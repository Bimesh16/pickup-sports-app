package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.PresenceEvent;
import com.bmessi.pickupsportsapp.service.presence.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presence;
    private final SimpMessagingTemplate messaging;

    private String topic(Long gameId) {
        return "/topic/games/" + gameId + "/presence";
    }

    /** Client sends: /app/games/{gameId}/presence/heartbeat (no body needed) */
    @MessageMapping("/games/{gameId}/presence/heartbeat")
    public void heartbeat(@DestinationVariable Long gameId, Principal principal) {
        String user = principal.getName();
        boolean isJoin = presence.heartbeat(gameId, user);
        long count = presence.onlineCount(gameId);

        var event = isJoin ? PresenceEvent.join(gameId, user, count)
                : PresenceEvent.beat(gameId, user, count);

        messaging.convertAndSend(topic(gameId), event);
    }

    /** Client sends on tab close or navigate away (best-effort): /app/games/{gameId}/presence/leave */
    @MessageMapping("/games/{gameId}/presence/leave")
    public void leave(@DestinationVariable Long gameId, Principal principal) {
        String user = principal.getName();
        presence.leave(gameId, user);
        long count = presence.onlineCount(gameId);
        messaging.convertAndSend(topic(gameId), PresenceEvent.leave(gameId, user, count));
    }

    // HTTP presence listing is provided by ChatPresenceController under /games/{gameId}/presence.
    // Removed duplicate to prevent ambiguous mapping.
}
