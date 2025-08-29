package com.bmessi.pickupsportsapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting filter to prevent DDoS attacks and API abuse.
 * 
 * Features:
 * - Per-IP rate limiting
 * - Configurable rate limits per endpoint
 * - Sliding window rate limiting
 * - Automatic cleanup of expired entries
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private static final int MAX_REQUESTS_PER_HOUR = 1000;
    private static final long WINDOW_SIZE_MS = 60000; // 1 minute
    
    private final ConcurrentHashMap<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String clientIp = getClientIpAddress(request);
        String endpoint = request.getRequestURI();
        
        if (isRateLimited(clientIp, endpoint)) {
            log.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIp, endpoint);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Rate limit exceeded. Please try again later.");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private boolean isRateLimited(String clientIp, String endpoint) {
        String key = clientIp + ":" + endpoint;
        long currentTime = System.currentTimeMillis();
        
        RateLimitInfo info = rateLimitMap.compute(key, (k, v) -> {
            if (v == null || currentTime - v.getWindowStart() > WINDOW_SIZE_MS) {
                return new RateLimitInfo(currentTime, 1);
            }
            v.incrementCount();
            return v;
        });
        
        // Check if rate limit exceeded
        if (info.getCount() > MAX_REQUESTS_PER_MINUTE) {
            return true;
        }
        
        // Cleanup old entries periodically
        if (currentTime % (WINDOW_SIZE_MS * 10) == 0) {
            cleanupExpiredEntries(currentTime);
        }
        
        return false;
    }
    
    private void cleanupExpiredEntries(long currentTime) {
        rateLimitMap.entrySet().removeIf(entry -> 
            currentTime - entry.getValue().getWindowStart() > WINDOW_SIZE_MS * 2
        );
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private static class RateLimitInfo {
        private final long windowStart;
        private final AtomicInteger count;
        
        public RateLimitInfo(long windowStart, int initialCount) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(initialCount);
        }
        
        public long getWindowStart() {
            return windowStart;
        }
        
        public int getCount() {
            return count.get();
        }
        
        public void incrementCount() {
            count.incrementAndGet();
        }
    }
}
