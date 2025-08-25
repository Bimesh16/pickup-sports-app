package com.bmessi.pickupsportsapp.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Correlation-Id";
    public static final String MDC_KEY = "cid";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String incoming = request.getHeader(HEADER);
        String cid = (incoming != null && !incoming.isBlank()) ? sanitize(incoming) : UUID.randomUUID().toString();

        // Propagate to logs and downstream
        request.setAttribute(HEADER, cid);
        MDC.put(MDC_KEY, cid);
        response.setHeader(HEADER, cid);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    private static String sanitize(String raw) {
        String v = raw.trim();
        if (v.length() > 64) v = v.substring(0, 64);
        return v.replaceAll("[^A-Za-z0-9._-]", "");
    }
}