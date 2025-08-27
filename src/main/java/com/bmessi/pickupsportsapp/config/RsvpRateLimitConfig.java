package com.bmessi.pickupsportsapp.config;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Configuration
public class RsvpRateLimitConfig {

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> rsvpRateLimitFilter() {
        RateLimiter limiter = RateLimiter.of("rsvp", RateLimiterConfig.custom()
                .limitRefreshPeriod(Duration.ofSeconds(10))
                .limitForPeriod(4)
                .timeoutDuration(Duration.ZERO)
                .build());

        OncePerRequestFilter filter = new OncePerRequestFilter() {
            @Override
            protected boolean shouldNotFilter(HttpServletRequest request) {
                String uri = request.getRequestURI();
                return !(("POST".equals(request.getMethod()) && uri.matches("/games/\\d+/join")) ||
                        ("DELETE".equals(request.getMethod()) && uri.matches("/games/\\d+/leave")));
            }

            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                if (!limiter.acquirePermission()) {
                    long retryAfter = limiter.getRateLimiterConfig().getLimitRefreshPeriod().toSeconds();
                    response.setStatus(429);
                    response.setContentType("application/json");
                    response.setHeader("Retry-After", String.valueOf(retryAfter));
                    response.getWriter().write("{\"error\":\"too_many_requests\",\"retryAfter\":" + retryAfter + "}");
                    return;
                }
                filterChain.doFilter(request, response);
            }
        };

        FilterRegistrationBean<OncePerRequestFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(filter);
        bean.addUrlPatterns("/games/*");
        bean.setOrder(Integer.MIN_VALUE + 1);
        return bean;
    }
}
