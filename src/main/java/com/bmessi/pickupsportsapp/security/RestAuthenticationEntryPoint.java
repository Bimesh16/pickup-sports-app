package com.bmessi.pickupsportsapp.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * AuthenticationEntryPoint that returns standardized JSON error bodies.
 */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("error", "unauthenticated");
        errorBody.put("message", "Authentication is required");
        errorBody.put("status", HttpStatus.UNAUTHORIZED.value());
        errorBody.put("path", request.getRequestURI());
        
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        om.writeValue(response.getOutputStream(), errorBody);
    }
}
