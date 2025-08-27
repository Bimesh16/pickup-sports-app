package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.advice.GlobalExceptionHandler;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;
import java.util.Map;

/**
 * AuthenticationEntryPoint that returns standardized JSON error bodies.
 */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final GlobalExceptionHandler handler;

    public RestAuthenticationEntryPoint(GlobalExceptionHandler handler) {
        this.handler = handler;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        ResponseEntity<Map<String, Object>> entity = handler.handleAuthentication(authException, request);
        response.setStatus(entity.getStatusCodeValue());
        entity.getHeaders().forEach((k, v) -> v.forEach(val -> response.addHeader(k, val)));
        Map<String, Object> body = entity.getBody();
        if (body != null) {
            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            om.writeValue(response.getOutputStream(), body);
        }
    }
}
