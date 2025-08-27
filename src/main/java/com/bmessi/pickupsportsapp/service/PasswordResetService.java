package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.config.properties.AuthFlowProperties;
import com.bmessi.pickupsportsapp.entity.PasswordResetToken;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.PasswordResetTokenRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom RNG = new SecureRandom();

    private final PasswordResetTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthFlowProperties props;
    private final EmailService emailService;
    private final com.bmessi.pickupsportsapp.security.SecurityAuditService audit;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private io.micrometer.core.instrument.MeterRegistry meterRegistry;

    private final java.util.concurrent.ConcurrentHashMap<String, Window> userWindows = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.ConcurrentHashMap<String, Window> ipWindows = new java.util.concurrent.ConcurrentHashMap<>();

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.bmessi.pickupsportsapp.security.RedisRateLimiterService redisRateLimiter;

    private static final class Window {
        volatile long start = System.currentTimeMillis();
        final java.util.concurrent.atomic.AtomicInteger count = new java.util.concurrent.atomic.AtomicInteger(0);
    }

    @Transactional
    public void requestReset(String username, String requesterIp) {
        // Rate limiting (best-effort, in-memory)
        long now = System.currentTimeMillis();
        int perUser = Math.max(1, props.getResetMaxPerUserPerMinute());
        int perIp = Math.max(1, props.getResetMaxPerIpPerMinute());
        long windowMs = 60_000L;

        // Optional distributed limiter
        if (redisRateLimiter != null) {
            if (username != null && !username.isBlank() && !redisRateLimiter.allow("forgot:user:" + username.toLowerCase(), perUser, 60)) {
                try { meterRegistry.counter("auth.forgot.attempts", "result", "denied", "scope", "user").increment(); } catch (Exception ignore) {}
                return;
            }
            if (requesterIp != null && !requesterIp.isBlank() && !redisRateLimiter.allow("forgot:ip:" + requesterIp, perIp, 60)) {
                try { meterRegistry.counter("auth.forgot.attempts", "result", "denied", "scope", "ip").increment(); } catch (Exception ignore) {}
                return;
            }
        }

        if (username != null && !username.isBlank()) {
            Window w = userWindows.computeIfAbsent(username.toLowerCase(), k -> new Window());
            if (now - w.start >= windowMs) { w.start = now; w.count.set(0); }
            if (w.count.incrementAndGet() > perUser) {
                try { meterRegistry.counter("auth.forgot.attempts", "result", "denied", "scope", "user").increment(); } catch (Exception ignore) {}
                return; // silently drop to avoid enumeration and abuse
            }
        }
        if (requesterIp != null && !requesterIp.isBlank()) {
            Window w = ipWindows.computeIfAbsent(requesterIp, k -> new Window());
            if (now - w.start >= windowMs) { w.start = now; w.count.set(0); }
            if (w.count.incrementAndGet() > perIp) {
                try { meterRegistry.counter("auth.forgot.attempts", "result", "denied", "scope", "ip").increment(); } catch (Exception ignore) {}
                return;
            }
        }

        var user = userRepo.findByUsername(username);
        if (user == null) {
            // Don't reveal user existence
            return;
        }
        // Clean up previous tokens for user
        tokenRepo.deleteByUsername(user.getUsername());

        String token = randomToken();
        String tokenHash = hashToken(token);
        PasswordResetToken prt = PasswordResetToken.builder()
                .username(user.getUsername())
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(props.getResetTtlHours(), ChronoUnit.HOURS))
                .build();
        tokenRepo.save(prt);
        try { meterRegistry.counter("auth.forgot.attempts", "result", "allowed", "scope", "user").increment(); } catch (Exception ignore) {}

        // Build reset link and send email (best-effort; failures are logged by EmailService)
        String base = props.getAppUrl();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        String link = base + "/auth/reset?token=" + token;
        try {
            emailService.sendPasswordResetEmail(user.getUsername(), link);
        } catch (Exception ignore) {
            // do not propagate mailing failures
        }
    }

    @Transactional(readOnly = true)
    public boolean isValid(String token) {
        var prt = tokenRepo.findByTokenHash(hashToken(token)).orElse(null);
        if (prt == null) return false;
        if (prt.getConsumedAt() != null) return false;
        return !prt.getExpiresAt().isBefore(Instant.now());
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        var prt = tokenRepo.findByTokenHash(hashToken(token)).orElse(null);
        if (prt == null) return false;
        if (prt.getConsumedAt() != null) return false;
        if (prt.getExpiresAt().isBefore(Instant.now())) return false;

        User user = userRepo.findByUsername(prt.getUsername());
        if (user == null) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        prt.setConsumedAt(Instant.now());
        tokenRepo.save(prt);
        // delete other tokens for user
        tokenRepo.deleteByUsername(prt.getUsername());
        try { audit.passwordReset(user.getUsername()); } catch (Exception ignore) {}
        return true;
    }

    private static String randomToken() {
        byte[] bytes = new byte[48];
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hashToken(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(token.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
