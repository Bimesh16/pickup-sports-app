package com.bmessi.pickupsportsapp.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds modern security headers to all HTTP responses.
 * These are safe defaults for APIs and can be adjusted per environment if needed.
 */
@Component("webSecurityHeadersFilter")
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    // Strict CSP for API and most endpoints
    private static final String CSP_STRICT =
            "default-src 'none'; " +
                    "img-src 'self' data:; " +
                    "script-src 'none'; " +
                    "style-src 'self'; " +
                    "font-src 'self' data:; " +
                    "connect-src 'self'; " +
                    "frame-ancestors 'none'; " +
                    "base-uri 'self'";

    // Relaxed CSP for Swagger UI pages (needs scripts and some inline code/styles)
    private static final String CSP_SWAGGER =
            "default-src 'self'; " +
                    "img-src 'self' data:; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "font-src 'self' data:; " +
                    "connect-src 'self'; " +
                    "frame-ancestors 'self'; " +
                    "base-uri 'self'";

    private static final String PERMISSIONS_POLICY =
            "geolocation=(), microphone=(), camera=(), " +
                    "payment=(), usb=(), bluetooth=(), accelerometer=(), " +
                    "ambient-light-sensor=(), gyroscope=(), magnetometer=(), " +
                    "screen-wake-lock=(), clipboard-read=(), clipboard-write=()";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isSwagger = path != null && (
                path.equals("/swagger-ui.html")
                        || path.startsWith("/swagger-ui")
                        || path.startsWith("/v3/api-docs")
        );

        // Don’t overwrite if already set upstream
        setIfAbsent(response, "X-Content-Type-Options", "nosniff");
        setIfAbsent(response, "X-Frame-Options", "DENY");
        setIfAbsent(response, "Referrer-Policy", "no-referrer");
        setIfAbsent(response, "X-XSS-Protection", "0");
        setIfAbsent(response, "Permissions-Policy", PERMISSIONS_POLICY);

        // Use a Swagger-friendly CSP for docs, strict elsewhere
        setIfAbsent(response, "Content-Security-Policy", isSwagger ? CSP_SWAGGER : CSP_STRICT);

        // Only set HSTS when the connection is secure (avoid dev/http issues)
        if (request.isSecure()) {
            setIfAbsent(response, "Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        chain.doFilter(request, response);
    }

    private static void setIfAbsent(HttpServletResponse resp, String header, String value) {
        if (resp.getHeader(header) == null) {
            resp.setHeader(header, value);
        }
    }
}

