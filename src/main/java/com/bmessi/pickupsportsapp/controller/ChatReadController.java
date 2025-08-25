package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ReadStatusDTO;
import com.bmessi.pickupsportsapp.dto.api.StatusResponse;
import com.bmessi.pickupsportsapp.entity.ChatReadCursor;
import com.bmessi.pickupsportsapp.service.ReadReceiptService;
import com.bmessi.pickupsportsapp.service.chat.ChatReadService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/games/{gameId}/chat")
@RequiredArgsConstructor
public class ChatReadController {

    private final ChatReadService service;
    private final SimpMessagingTemplate broker;
    private final ReadReceiptService readReceiptService;

    @PostMapping("/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StatusResponse> read(@PathVariable Long gameId,
                                               @RequestBody Map<String, Object> body,
                                               Principal principal) {
        String user = principal != null ? principal.getName() : "unknown";
        Object last = body != null ? body.get("lastRead") : null;
        broker.convertAndSend("/topic/games/" + gameId + "/read", Map.of(
                "user", user,
                "lastRead", last,
                "ts", Instant.now().toEpochMilli()
        ));
        return ResponseEntity.ok().headers(noStore()).body(new StatusResponse("ok"));
    }

    @GetMapping("/read-cursor")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatReadCursor> getCursor(@PathVariable Long gameId, Principal principal) {
        ChatReadCursor c = service.getOrDefault(principal.getName(), gameId);
        return ResponseEntity.ok().headers(noStore()).body(c);
    }

    public record PutCursorRequest(
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant lastReadAt,
            Long lastReadMessageId) {}

    @PutMapping("/read-cursor")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> putCursor(@PathVariable Long gameId,
                                                         @RequestBody PutCursorRequest req,
                                                         Principal principal) {
        Instant ts = req != null ? req.lastReadAt() : null;
        Long mid = req != null ? req.lastReadMessageId() : null;
        ChatReadCursor saved = service.update(principal.getName(), gameId, ts, mid);
        return ResponseEntity.ok().headers(noStore()).body(Map.of(
                "lastReadAt", saved.getLastReadAt(),
                "lastReadMessageId", saved.getLastReadMessageId()
        ));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> unread(@PathVariable Long gameId, Principal principal) {
        long count = service.unreadCount(principal.getName(), gameId);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("unread", count));
    }

    @GetMapping("/read-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReadStatusDTO> status(@PathVariable Long gameId, @RequestParam Long messageId) {
        if (messageId == null || messageId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "messageId must be positive");
        }
        ReadStatusDTO body = readReceiptService.status(gameId, messageId);
        return ResponseEntity.ok().headers(noStore()).body(body);
    }

    private static HttpHeaders noStore() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }
}
