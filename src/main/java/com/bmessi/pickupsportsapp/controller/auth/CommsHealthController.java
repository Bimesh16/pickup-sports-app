package com.bmessi.pickupsportsapp.controller.auth;

import com.bmessi.pickupsportsapp.service.EmailService;
import com.bmessi.pickupsportsapp.service.SmsService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

/**
 * Public comms health for quick verification (under /auth to be publicly accessible per security config).
 * Avoids sending content unless explicitly requested (dry-run for email would still send); SMS/email existence is reported.
 */
@RestController
@RequestMapping("/auth/comms")
public class CommsHealthController {

    private final Optional<EmailService> emailService;
    private final Optional<SmsService> smsService;

    public CommsHealthController(@Autowired(required = false) EmailService emailService,
                                 @Autowired(required = false) SmsService smsService) {
        this.emailService = Optional.ofNullable(emailService);
        this.smsService = Optional.ofNullable(smsService);
    }

    @GetMapping("/health")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok().headers(noStore()).body(Map.of(
                "emailEnabled", emailService.isPresent(),
                "smsEnabled", smsService.isPresent()
        ));
    }

    @PostMapping("/test/email")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> testEmail(@RequestParam("to") String to,
                                                         @RequestParam(value = "type", defaultValue = "reset") String type,
                                                         @RequestParam(value = "link", defaultValue = "https://example/reset") String link) {
        if (emailService.isEmpty()) {
            return ResponseEntity.status(503).headers(noStore()).body(Map.of(
                    "error", "service_unavailable",
                    "message", "Email service disabled"
            ));
        }
        switch (type.toLowerCase()) {
            case "welcome" -> emailService.get().sendWelcomeEmailNow(to);
            case "reset" -> emailService.get().sendPasswordResetEmailNow(to, link, java.util.Locale.getDefault());
            default -> emailService.get().sendWelcomeEmailNow(to);
        }
        return ResponseEntity.ok().headers(noStore()).body(Map.of("sent", true));
    }

    @PostMapping("/test/sms")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> testSms(@RequestParam("to") String to,
                                                       @RequestParam(value = "message", defaultValue = "Hello from Pickup Sports!") String message) {
        if (smsService.isEmpty()) {
            return ResponseEntity.status(503).headers(noStore()).body(Map.of(
                    "error", "service_unavailable",
                    "message", "SMS service disabled"
            ));
        }
        smsService.get().sendGenericSms(to, message);
        return ResponseEntity.ok().headers(noStore()).body(Map.of("sent", true));
    }
}

