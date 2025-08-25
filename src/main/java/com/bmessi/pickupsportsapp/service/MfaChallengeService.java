package com.bmessi.pickupsportsapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MfaChallengeService {

    private static final SecureRandom RNG = new SecureRandom();

    private final long ttlSeconds;
    private final int maxPerMinute;

    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public MfaChallengeService(@Value("${auth.mfa.challenge.ttl-seconds:180}") long ttlSeconds,
                               @Value("${auth.mfa.challenge.max-per-minute:6}") int maxPerMinute) {
        this.ttlSeconds = Math.max(30L, ttlSeconds);
        this.maxPerMinute = Math.max(1, maxPerMinute);
    }

    public String create(String username) {
        // Simple in-memory rate limiting per username
        if (username != null && !username.isBlank()) {
            Window w = windows.computeIfAbsent(username.toLowerCase(), k -> new Window());
            long now = System.currentTimeMillis();
            if (now - w.startMs >= 60_000L) {
                w.startMs = now;
                w.count.set(0);
            }
            if (w.count.incrementAndGet() > maxPerMinute) {
                throw new IllegalStateException("Too many MFA challenges");
            }
        }

        byte[] bytes = new byte[24];
        RNG.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        store.put(token, new Entry(username, Instant.now().plusSeconds(ttlSeconds)));
        return token;
    }

    public String consumeIfValid(String token) {
        if (token == null || token.isBlank()) return null;
        Entry e = store.remove(token);
        if (e == null) return null;
        if (Instant.now().isAfter(e.expiresAt)) return null;
        return e.username;
    }

    private record Entry(String username, Instant expiresAt) {}

    private static final class Window {
        volatile long startMs = System.currentTimeMillis();
        final AtomicInteger count = new AtomicInteger(0);
    }
}
