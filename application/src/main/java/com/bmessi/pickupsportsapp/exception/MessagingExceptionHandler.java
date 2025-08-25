package com.bmessi.pickupsportsapp.exception;

import org.slf4j.MDC;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Converts exceptions thrown from @MessageMapping handlers into a per-user
 * STOMP error payload published to /user/queue/errors.
 */
@Controller
public class MessagingExceptionHandler {

    @MessageExceptionHandler(MessagingException.class)
    @SendToUser("/queue/errors")
    public Map<String, Object> handleMessagingException(MessagingException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "messaging_error");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Messaging error");
        body.put("timestamp", Instant.now().toEpochMilli());
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            body.put("traceId", cid);
        }
        return body;
    }

    @MessageExceptionHandler(ResponseStatusException.class)
    @SendToUser("/queue/errors")
    public Map<String, Object> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "messaging_error");
        body.put("message", ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString());
        body.put("status", ex.getStatusCode().value());
        body.put("timestamp", Instant.now().toEpochMilli());
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            body.put("traceId", cid);
        }
        return body;
    }

    @MessageExceptionHandler(IllegalArgumentException.class)
    @SendToUser("/queue/errors")
    public Map<String, Object> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "bad_request");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Invalid request");
        body.put("status", 400);
        body.put("timestamp", Instant.now().toEpochMilli());
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            body.put("traceId", cid);
        }
        return body;
    }

    @MessageExceptionHandler(Exception.class)
    @SendToUser("/queue/errors")
    public Map<String, Object> handleGeneric(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "internal_error");
        body.put("message", "Unexpected error");
        body.put("status", 500);
        body.put("timestamp", Instant.now().toEpochMilli());
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            body.put("traceId", cid);
        }
        return body;
    }
}
