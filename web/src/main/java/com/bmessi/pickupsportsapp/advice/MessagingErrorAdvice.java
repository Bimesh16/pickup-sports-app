package com.bmessi.pickupsportsapp.advice;

import com.bmessi.pickupsportsapp.dto.WsErrorDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class MessagingErrorAdvice {

    private static final Logger log = LoggerFactory.getLogger(MessagingErrorAdvice.class);

    private final SimpMessagingTemplate broker;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    public MessagingErrorAdvice(SimpMessagingTemplate broker, io.micrometer.core.instrument.MeterRegistry meterRegistry) {
        this.broker = broker;
        this.meterRegistry = meterRegistry;
    }

    @MessageExceptionHandler({ MessagingException.class, IllegalArgumentException.class })
    public void handleMessagingExceptions(Exception ex, Principal principal) {
        String user = principal != null ? principal.getName() : null;
        if (user == null || user.isBlank()) {
            log.debug("WS error for anonymous user: {}", ex.getMessage());
            return;
        }
        String code = mapCode(ex);
        String message = mapMessage(ex);
        try { meterRegistry.counter("ws.errors", "code", code).increment(); } catch (Exception ignore) {}
        broker.convertAndSendToUser(user, "/queue/errors", new WsErrorDTO(code, message, System.currentTimeMillis()));
    }

    private static String mapCode(Exception ex) {
        String m = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        if (m.contains("rate_limit")) return "rate_limit";
        if (m.contains("moderation")) return "moderation";
        if (m.contains("access denied")) return "forbidden";
        if (m.contains("authentication")) return "unauthorized";
        return "bad_request";
        }

    private static String mapMessage(Exception ex) {
        String m = ex.getMessage();
        if (m == null || m.isBlank()) return "Request failed";
        return m;
    }
}
