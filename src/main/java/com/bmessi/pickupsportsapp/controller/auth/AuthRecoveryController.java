package com.bmessi.pickupsportsapp.controller.auth;

import com.bmessi.pickupsportsapp.service.PasswordResetService;
import com.bmessi.pickupsportsapp.service.EmailService;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

/**
 * Public account-recovery endpoints aligned with the frontend routes.
 * These complement existing AuthFlowController reset endpoints.
 */
@RestController
@RequestMapping("/auth")
public class AuthRecoveryController {

    private final Optional<PasswordResetService> passwordResetService;
    private final Optional<EmailService> emailService;
    private final Optional<com.bmessi.pickupsportsapp.service.SmsService> smsService;
    private final UserRepository userRepository;

    public AuthRecoveryController(@Autowired(required = false) PasswordResetService passwordResetService,
                                  @Autowired(required = false) EmailService emailService,
                                  @Autowired(required = false) com.bmessi.pickupsportsapp.service.SmsService smsService,
                                  UserRepository userRepository) {
        this.passwordResetService = Optional.ofNullable(passwordResetService);
        this.emailService = Optional.ofNullable(emailService);
        this.smsService = Optional.ofNullable(smsService);
        this.userRepository = userRepository;
    }

    /**
     * Accepts email or phone; if a matching account exists, sends a password reset email.
     * Always responds 200 to avoid user enumeration.
     */
    @PostMapping("/forgot-password")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        // Determine username (we treat email as username in this app)
        String username = null;
        if (req.email() != null && !req.email().isBlank()) {
            username = req.email().trim();
        } else if (req.phone() != null && !req.phone().isBlank()) {
            username = userRepository.findByPhone(req.phone().trim())
                    .map(u -> u.getUsername()).orElse(null);
        }

        if (passwordResetService.isPresent() && username != null) {
            try {
                String token = passwordResetService.get().requestResetReturningToken(username, null);
                if (token != null) {
                    String link = passwordResetService.get().buildResetLink(token);
                    // Send email if email path
                    if (req.email() != null && !req.email().isBlank() && emailService.isPresent()) {
                        try { emailService.get().sendPasswordResetEmail(username, link); } catch (Exception ignore) {}
                    }
                    // Send SMS if phone path
                    if (req.phone() != null && !req.phone().isBlank() && smsService.isPresent()) {
                        try { smsService.get().sendPasswordResetSms(req.phone().trim(), link); } catch (Exception ignore) {}
                    }
                }
            } catch (Exception ignore) {}
        }
        return ResponseEntity.ok().headers(noStore()).body(Map.of(
                "message", "If the account exists, reset instructions were sent"
        ));
    }

    /**
     * Complete a password reset using token + newPassword.
     */
    @PostMapping("/reset-password")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        if (req.newPassword().length() < 8 || req.newPassword().length() > 255) {
            return ResponseEntity.badRequest().headers(noStore()).body(Map.of(
                    "error", "invalid_request",
                    "message", "Password must be between 8 and 255 characters"
            ));
        }
        if (passwordResetService.isEmpty()) {
            return ResponseEntity.status(503).headers(noStore()).body(Map.of(
                    "error", "service_unavailable",
                    "message", "Password reset service is not available"
            ));
        }
        boolean ok = passwordResetService.get().resetPassword(req.token(), req.newPassword());
        if (!ok) {
            return ResponseEntity.badRequest().headers(noStore()).body(Map.of(
                    "error", "invalid_token",
                    "message", "Reset token is invalid or expired"
            ));
        }
        return ResponseEntity.ok().headers(noStore()).body(Map.of(
                "message", "Password updated"
        ));
    }

    /**
     * Accepts email or phone; if an account exists and email service is configured, send username reminder.
     * Always 200 to avoid enumeration.
     */
    @PostMapping("/forgot-username")
    @RateLimiter(name = "auth")
    public ResponseEntity<Map<String, Object>> forgotUsername(@Valid @RequestBody ForgotUsernameRequest req) {
        String to = null;
        String username = null;
        if (req.email() != null && !req.email().isBlank()) {
            to = req.email().trim();
            username = userRepository.findByUsernameIgnoreCase(to).map(u -> u.getUsername()).orElse(null);
        } else if (req.phone() != null && !req.phone().isBlank()) {
            var u = userRepository.findByPhone(req.phone().trim()).orElse(null);
            if (u != null) {
                username = u.getUsername();
                to = u.getUsername(); // send to email-on-file
                // additionally, if SMS enabled, send username to the provided phone number
                if (smsService.isPresent()) {
                    try { smsService.get().sendUsernameReminderSms(req.phone().trim(), username); } catch (Exception ignore) {}
                }
            }
        }

        if (username != null && to != null && emailService.isPresent()) {
            try {
                emailService.get().sendUsernameReminderEmailNow(to, username, Locale.getDefault());
            } catch (Exception ignore) {}
        }
        return ResponseEntity.ok().headers(noStore()).body(Map.of(
                "message", "If the account exists, your username has been sent"
        ));
    }

    // DTOs
    public record ForgotPasswordRequest(String email, String phone) {}
    public record ResetPasswordRequest(@NotBlank String token, @NotBlank String newPassword) {}
    public record ForgotUsernameRequest(String email, String phone) {}
}
