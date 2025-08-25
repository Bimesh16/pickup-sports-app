package com.bmessi.pickupsportsapp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds strict security headers in production.
 * - HSTS for 6 months
 * - A conservative default CSP
 */
@Profile("prod")
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class StrictSecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (!response.containsHeader("Strict-Transport-Security")) {
            response.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains; preload");
        }
        if (!response.containsHeader("Content-Security-Policy")) {
            // Conservative CSP: adjust for your prod CDN/fonts/etc.
            response.setHeader("Content-Security-Policy",
                    "default-src 'self'; " +
                    "img-src 'self' data:; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "script-src 'self'; " +
                    "font-src 'self' data:; " +
                    "connect-src 'self'");
        }
        if (!response.containsHeader("Referrer-Policy")) {
            response.setHeader("Referrer-Policy", "no-referrer");
        }
        if (!response.containsHeader("X-Content-Type-Options")) {
            response.setHeader("X-Content-Type-Options", "nosniff");
        }
        if (!response.containsHeader("X-Frame-Options")) {
            response.setHeader("X-Frame-Options", "DENY");
        }

        filterChain.doFilter(request, response);
    }
}
