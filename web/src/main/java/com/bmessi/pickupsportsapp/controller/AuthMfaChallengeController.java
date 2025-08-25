package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.service.AuthService;
import com.bmessi.pickupsportsapp.service.MfaChallengeService;
import com.bmessi.pickupsportsapp.service.MfaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.util.Map;

@RestController
@RequestMapping("/auth/mfa")
@RequiredArgsConstructor
public class AuthMfaChallengeController {

    private final MfaService mfaService;
    private final MfaChallengeService challenges;
    private final AuthService authService;
    private final com.bmessi.pickupsportsapp.config.properties.RefreshCookieProperties cookieProps;
    private final com.bmessi.pickupsportsapp.service.TrustedDeviceService trustedDeviceService;
    private final com.bmessi.pickupsportsapp.service.MfaRecoveryService mfaRecoveryService;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private final java.util.Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> redisRateLimiter;

    public record VerifyRequest(@NotBlank String challenge, @NotBlank String code, Boolean rememberDevice, String deviceId) {}

    @PostMapping("/verify")
    @io.github.resilience4j.ratelimiter.annotation.RateLimiter(name = "mfa")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            String ip = httpRequest.getRemoteAddr();
            String key = "mfa:verify:" + (request.challenge() == null ? "" : request.challenge()) + ":" + ip;
            if (redisRateLimiter.isPresent() && !redisRateLimiter.get().allow(key, 10, 60)) {
                return ResponseEntity.status(429).headers(noStore()).body(Map.of(
                        "error", "too_many_requests",
                        "message", "Please try again later",
                        "timestamp", System.currentTimeMillis()
                ));
            }
        } catch (Exception ignore) {}

        String username = challenges.consumeIfValid(request.challenge());
        if (username == null) {
            return ResponseEntity.status(401).headers(noStore()).body(Map.of(
                    "error", "invalid_challenge",
                    "message", "Challenge invalid or expired",
                    "timestamp", System.currentTimeMillis()
            ));
        }

        boolean totpOk = false;
        try { totpOk = mfaService.verify(username, request.code()); } catch (Exception ignore) {}

        boolean recoveryOk = false;
        if (!totpOk) {
            try { recoveryOk = mfaRecoveryService.consume(request.code()); } catch (Exception ignore) {}
            if (!recoveryOk) {
                try { meterRegistry.counter("mfa.verify", "result", "failure").increment(); } catch (Exception ignore) {}
                return ResponseEntity.status(401).headers(noStore()).body(Map.of(
                        "error", "invalid_code",
                        "message", "MFA code invalid",
                        "timestamp", System.currentTimeMillis()
                ));
            }
        }

        if (Boolean.TRUE.equals(request.rememberDevice())) {
            try { trustedDeviceService.trust(username, request.deviceId()); } catch (Exception ignore) {}
        }
        try {
            meterRegistry.counter("mfa.verify", "result", "success", "method", totpOk ? "totp" : "recovery").increment();
        } catch (Exception ignore) {}

        TokenPairResponse tokens = authService.issueTokensForAuthenticatedUser(username);
        HttpHeaders headers = noStore();
        if (cookieProps.isEnabled()) {
            boolean secure = httpRequest.isSecure() || "https".equalsIgnoreCase(httpRequest.getHeader("X-Forwarded-Proto"));
            String cookie = cookieProps.getName() + "=" + tokens.refreshToken() + "; Path=" + cookieProps.getPath()
                    + "; SameSite=" + cookieProps.getSameSite() + "; " + (cookieProps.isHttpOnly() ? "HttpOnly; " : "")
                    + (secure ? "Secure; " : "") + "Max-Age=" + Math.max(0, cookieProps.getMaxAgeDays() * 24 * 60 * 60);
            headers.add(HttpHeaders.SET_COOKIE, cookie);
        }
        return ResponseEntity.ok().headers(headers).body(tokens);
    }

    
}
