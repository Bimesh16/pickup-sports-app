package com.bmessi.pickupsportsapp.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * Adds standard security headers to all HTTP responses.
 * Keeps CSP permissive enough for dev and Swagger; tighten in prod as needed.
 */
@Configuration
public class SecurityHeadersConfig {

    @Bean
    public FilterRegistrationBean<Filter> securityHeadersFilter() {
        Filter f = (request, response, chain) -> {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse res = (HttpServletResponse) response;

            // Basic security headers
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "DENY");
            res.setHeader("Referrer-Policy", "no-referrer");
            res.setHeader("X-XSS-Protection", "0");
            // Permissions-Policy: adjust as needed
            res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

            // CSP kept permissive for dev/Swagger; allow jsDelivr for chat-test.html libraries
            String csp = "default-src 'self'; " +
                    "connect-src 'self' http: https: ws: wss:; " +
                    "img-src 'self' data:; " +
                    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
                    "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
                    "font-src 'self' data:;";
            res.setHeader("Content-Security-Policy", csp);

            chain.doFilter(req, res);
        };

        FilterRegistrationBean<Filter> reg = new FilterRegistrationBean<>(f);
        reg.setOrder(Integer.MIN_VALUE + 50); // early but after core container filters
        reg.setName("securityHeadersFilter");
        return reg;
        };
}
