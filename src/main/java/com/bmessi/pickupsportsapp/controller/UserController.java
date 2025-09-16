package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.CreateUserRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.service.UserService;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.security.RedisRateLimiterService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.time.Duration;
import com.bmessi.pickupsportsapp.service.IdempotencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.net.URI;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final java.util.Optional<RedisRateLimiterService> redisRateLimiterService;
    private final IdempotencyService idempotencyService;
    private final java.util.Optional<StringRedisTemplate> redisTemplate;
    @Value("${user.username.cache.redis.enabled:true}")
    private boolean redisUsernameCacheEnabled;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody CreateUserRequest request,
                                            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                            @RequestHeader(value = "Prefer", required = false) String prefer) {
        // Normalize headers
        String idem = (idempotencyKey == null || idempotencyKey.isBlank()) ? null : idempotencyKey.trim();
        boolean preferMinimal = prefer != null && prefer.toLowerCase().contains("return=minimal");

        // If idempotency key provided and we have a recorded result for this username+key, replay
        if (idem != null) {
            var existing = idempotencyService.get(request.username(), idem);
            if (existing.isPresent()) {
                HttpHeaders headers = noStore();
                headers.add("Preference-Applied", "return=minimal");
                return ResponseEntity.ok().headers(headers).build();
            }
        }

        // First-time registration
        UserDTO user = userService.register(request);

        // Default locale from Accept-Language, best-effort (ignore failures)
        try {
            String accept = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes() instanceof org.springframework.web.context.request.ServletRequestAttributes sra
                    ? sra.getRequest().getHeader("Accept-Language")
                    : null;
            if (accept != null && !accept.isBlank() && user != null && user.id() != null) {
                String tag = java.util.Locale.forLanguageTag(accept.split(",")[0]).toLanguageTag();
                if (tag != null && !tag.isBlank()) {
                    com.bmessi.pickupsportsapp.util.Jdbc.exec("UPDATE app_user SET locale = ? WHERE id = ?", tag, user.id());
                }
            }
        } catch (Exception ignore) {}

        // Record idempotency mapping for future replays
        if (idem != null && user != null && user.id() != null) {
            idempotencyService.put(request.username(), idem, user.id());
        }

        HttpHeaders headers = noStore();
        URI location = URI.create("/users/" + (user != null && user.id() != null ? user.id() : ""));
        if (preferMinimal) {
            headers.add("Preference-Applied", "return=minimal");
            return ResponseEntity.created(location).headers(headers).build();
        }
        return ResponseEntity.created(location).headers(headers).body(user);
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam("username") String username,
                                           jakarta.servlet.http.HttpServletRequest request) {
        // Tiny rate limiter: prefer Redis if enabled, else fall back to in-memory per-IP window
        try {
            String ip = getClientIp(request);
            String key = "username-check:" + (ip == null ? "unknown" : ip);
            if (redisRateLimiterService != null && redisRateLimiterService.isPresent()) {
                boolean ok = redisRateLimiterService.get().allow(key, 30, 60); // 30 req/min per IP
                if (!ok) {
                    HttpHeaders h = noStore();
                    h.add("Retry-After", "60");
                    return ResponseEntity.status(429).headers(h).body(java.util.Map.of("error", "too_many_requests"));
                }
            } else {
                if (!InMemWindow.allow(key, 30, 60_000)) {
                    HttpHeaders h = noStore();
                    h.add("Retry-After", "60");
                    return ResponseEntity.status(429).headers(h).body(java.util.Map.of("error", "too_many_requests"));
                }
            }
        } catch (Exception ignore) {}
        String clean = username == null ? "" : username.trim().toLowerCase();
        boolean formatOk = clean.matches("^[a-z0-9_]{3,30}$");
        if (!formatOk) {
            return ResponseEntity.ok().headers(noStore()).body(java.util.Map.of(
                    "available", false,
                    "reason", "invalid_format"
            ));
        }
        // Short TTL cache to reduce DB load under bursts
        // Prefer Redis-backed short TTL cache across instances; fallback to in-memory
        if (redisUsernameCacheEnabled && redisTemplate != null && redisTemplate.isPresent()) {
            StringRedisTemplate redis = redisTemplate.get();
            String key = "uavail:" + clean;
            String cached = redis.opsForValue().get(key);
            if (cached != null) {
                boolean available = "1".equals(cached);
                return ResponseEntity.ok().headers(noStore()).body(java.util.Map.of("available", available));
            }
            boolean exists = userRepository.existsByUsername(clean);
            boolean available = !exists;
            try {
                redis.opsForValue().set(key, available ? "1" : "0", Duration.ofSeconds(10));
            } catch (Exception ignore) {}
            return ResponseEntity.ok().headers(noStore()).body(java.util.Map.of("available", available));
        }
        // Fallback in-memory cache
        CacheEntry cached = CACHE.get(clean);
        long now = System.currentTimeMillis();
        if (cached != null && now < cached.expiresAt) {
            return ResponseEntity.ok().headers(noStore()).body(java.util.Map.of("available", cached.available));
        }
        boolean exists = userRepository.existsByUsername(clean);
        boolean available = !exists;
        CACHE.put(clean, new CacheEntry(available, now + 10_000));
        return ResponseEntity.ok().headers(noStore()).body(java.util.Map.of(
                "available", available
        ));
    }

    private static String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) return xf.split(",")[0].trim();
        String xr = request.getHeader("X-Real-IP");
        if (xr != null && !xr.isBlank()) return xr;
        return request.getRemoteAddr();
    }

    // Minimal in-memory window counter
    static class InMemWindow {
        private static final java.util.concurrent.ConcurrentHashMap<String, Entry> MAP = new java.util.concurrent.ConcurrentHashMap<>();
        static boolean allow(String key, int limit, long windowMs) {
            long now = System.currentTimeMillis();
            Entry e = MAP.compute(key, (k, v) -> {
                if (v == null || now - v.start > windowMs) return new Entry(now, 1);
                v.count++;
                return v;
            });
            return e.count <= limit;
        }
        static class Entry { long start; int count; Entry(long s, int c){start=s;count=c;} }
    }

    // Simple in-memory username availability cache with short TTL
    private static final java.util.concurrent.ConcurrentHashMap<String, CacheEntry> CACHE = new java.util.concurrent.ConcurrentHashMap<>();
    private static class CacheEntry { final boolean available; final long expiresAt; CacheEntry(boolean a, long e){available=a;expiresAt=e;} }
    
}
