package com.bmessi.pickupsportsapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for /auth/login to mitigate brute-force attempts.
 * Limits requests per remote IP per minute. Defaults: 20/min.
 * For production, consider a distributed store (e.g., Redis) and IP/user-based keys.
 */
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private final int maxPerMinute;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public LoginRateLimitFilter() {
        this(20);
    }

    public LoginRateLimitFilter(int maxPerMinute) {
        this.maxPerMinute = Math.max(1, maxPerMinute);
    }

    private static final class Window {
        volatile long epochMinute;
        final AtomicInteger count = new AtomicInteger(0);
        Window(long epochMinute) { this.epochMinute = epochMinute; }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri == null || !uri.equals("/auth/login");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String ip = remoteIp(request);
        long nowMinute = Instant.now().getEpochSecond() / 60;

        Window w = windows.computeIfAbsent(ip, k -> new Window(nowMinute));
        synchronized (w) {
            if (w.epochMinute != nowMinute) {
                w.epochMinute = nowMinute;
                w.count.set(0);
            }
            int current = w.count.incrementAndGet();
            if (current > maxPerMinute) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"too_many_requests\",\"message\":\"Login rate limit exceeded\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private static String remoteIp(HttpServletRequest req) {
        String xf = req.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xf)) {
            int comma = xf.indexOf(',');
            return (comma > 0 ? xf.substring(0, comma) : xf).trim();
        }
        String rip = req.getRemoteAddr();
        return rip != null ? rip : "unknown";
    }
}
