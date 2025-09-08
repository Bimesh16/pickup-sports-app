package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.PasswordResetService;
import com.bmessi.pickupsportsapp.service.VerificationService;
import com.bmessi.pickupsportsapp.service.EmailService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthFlowController {

    // Optional DI-provided Redis rate limiter (present when configured)
    private final Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> redisRateLimiter;

    private static final Logger log = LoggerFactory.getLogger(AuthFlowController.class);

    private final Optional<VerificationService> verificationService;
    private final Optional<PasswordResetService> passwordResetService;
    private final Optional<EmailService> emailService;

    public AuthFlowController(Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> redisRateLimiter,
                             @Autowired(required = false) VerificationService verificationService,
                             @Autowired(required = false) PasswordResetService passwordResetService,
                             @Autowired(required = false) EmailService emailService) {
        this.redisRateLimiter = redisRateLimiter;
        this.verificationService = Optional.ofNullable(verificationService);
        this.passwordResetService = Optional.ofNullable(passwordResetService);
        this.emailService = Optional.ofNullable(emailService);
    }

    // Verify email using a one-time token (from email link)
    @PostMapping("/verify")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> verify(@Valid @RequestBody VerifyRequest request) {
        try {
            String key = "auth:verify:" + request.token();
            if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow(key, 10, 60)) {
                return ResponseEntity.status(429).headers(noStore()).body(Map.of(
                        "error", "too_many_requests",
                        "message", "Please try again later",
                        "timestamp", System.currentTimeMillis()
                ));
            }
        } catch (Exception ignore) {}
        if (verificationService.isEmpty()) {
            return ResponseEntity.status(503)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "service_unavailable",
                            "message", "Email verification service is not available",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
        boolean ok = verificationService.get().consume(request.token());
        if (!ok) {
            return ResponseEntity.status(400)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "invalid_token",
                            "message", "Verification token is invalid or expired",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
        return ResponseEntity.ok()
                .headers(noStore())
                .body(Map.of(
                        "message", "Email verified",
                        "timestamp", System.currentTimeMillis()
                ));
    }

    // Request a password reset link to be sent to the user's email.
    // Always returns 200 to avoid user enumeration.
    @PostMapping("/reset/request")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> requestReset(@Valid @RequestBody ResetRequest request,
                                                            HttpServletRequest httpRequest) {
        try {
            String ip = extractClientIp(httpRequest);
            String key = "auth:reset:req:" + (request.username() == null ? "" : request.username()) + ":" + ip;
            int perMinute = 20;
            try {
                // if login policy present, cap with its per-ip limit
                var cls = com.bmessi.pickupsportsapp.config.properties.LoginPolicyProperties.class;
                // no direct injection here; using default if not available
            } catch (Exception ignore) {}
            if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow(key, perMinute, 60)) {
                return ResponseEntity.status(429).headers(noStore()).body(Map.of(
                        "error", "too_many_requests",
                        "message", "Please try again later",
                        "timestamp", System.currentTimeMillis()
                ));
            }
        } catch (Exception ignore) {}
        if (passwordResetService.isPresent()) {
            String ip = extractClientIp(httpRequest);
            passwordResetService.get().requestReset(request.username(), ip);
        }
        return ResponseEntity.ok()
                .headers(noStore())
                .body(Map.of(
                        "message", "If the account exists, a password reset email will be sent",
                        "timestamp", System.currentTimeMillis()
                ));
    }

    // Complete password reset by submitting the token and a new password
    @PostMapping("/reset/complete")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> completeReset(@Valid @RequestBody ResetCompleteRequest request) {
        if (request.newPassword().length() < 8 || request.newPassword().length() > 255) {
            return ResponseEntity.status(400)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "invalid_request",
                            "message", "Password must be between 8 and 255 characters",
                            "timestamp", System.currentTimeMillis()
                    ));
        }

        if (passwordResetService.isEmpty()) {
            return ResponseEntity.status(503)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "service_unavailable",
                            "message", "Password reset service is not available",
                            "timestamp", System.currentTimeMillis()
                    ));
        }

        boolean ok = passwordResetService.get().resetPassword(request.token(), request.newPassword());
        if (!ok) {
            return ResponseEntity.status(400)
                    .headers(noStore())
                    .body(Map.of(
                            "error", "invalid_token",
                            "message", "Reset token is invalid or expired",
                            "timestamp", System.currentTimeMillis()
                    ));
        }

        return ResponseEntity.ok()
                .headers(noStore())
                .body(Map.of(
                        "message", "Password updated",
                        "timestamp", System.currentTimeMillis()
                ));
    }

    private static String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // Use the first IP in the list
            int comma = xff.indexOf(',');
            return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();
        return request.getRemoteAddr();
    }

    // DTOs
    public record VerifyRequest(@NotBlank String token) {}
    public record ResetRequest(@NotBlank String username) {}
    public record ResetCompleteRequest(@NotBlank String token, @NotBlank String newPassword) {}
}
