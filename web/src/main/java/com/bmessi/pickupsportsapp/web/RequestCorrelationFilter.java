package com.bmessi.pickupsportsapp.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Ensures each request has an {@code X-Request-Id} header and exposes it via MDC.
 * Propagates the value downstream and back in the response.
 */
public class RequestCorrelationFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Request-Id";
    public static final String MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String incoming = request.getHeader(HEADER);
        String requestId = (incoming != null && !incoming.isBlank()) ? sanitize(incoming) : UUID.randomUUID().toString();

        request.setAttribute(HEADER, requestId);
        MDC.put(MDC_KEY, requestId);
        response.setHeader(HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    private static String sanitize(String raw) {
        String v = raw.trim();
        if (v.length() > 64) {
            v = v.substring(0, 64);
        }
        return v.replaceAll("[^A-Za-z0-9._-]", "");
    }
}
