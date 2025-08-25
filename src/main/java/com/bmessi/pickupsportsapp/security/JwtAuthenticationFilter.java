package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.service.auth.AuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Collections;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final String authHeaderName;
    private final String authHeaderPrefix;

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager,
                                   AuthService authService,
                                   String loginUrl,
                                   String authHeaderName,
                                   String authHeaderPrefix) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
        this.authHeaderName = authHeaderName;
        this.authHeaderPrefix = authHeaderPrefix != null ? authHeaderPrefix : "Bearer ";
        setFilterProcessesUrl(loginUrl);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.readTree(request.getReader());

            if (json == null) {
                log.debug("Request body is null");
                throw new AuthenticationServiceException("Request body cannot be empty");
            }

            if (json.get("username") == null || json.get("password") == null) {
                log.debug("Missing username or password in request");
                throw new AuthenticationServiceException("Missing username or password");
            }

            String username = json.get("username").asText(null);
            String password = json.get("password").asText(null);

            if (username == null || username.isBlank()) {
                log.debug("Username is null or blank");
                throw new BadCredentialsException("Username cannot be empty");
            }

            if (password == null || password.isBlank()) {
                log.debug("Password is null or blank");
                throw new BadCredentialsException("Password cannot be empty");
            }

            log.debug("Attempting authentication for user: {}", username);

            UsernamePasswordAuthenticationToken authRequest =
                    new UsernamePasswordAuthenticationToken(username, password, Collections.emptyList());
            return authenticationManager.authenticate(authRequest);

        } catch (BadCredentialsException | AuthenticationServiceException e) {
            log.debug("Authentication attempt failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Authentication attempt error: {}", e.getMessage(), e);
            throw new AuthenticationServiceException("Invalid authentication request", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication auth) {
        try {
            Object principal = auth.getPrincipal();
            String username = (principal instanceof UserDetails ud) ? ud.getUsername() : auth.getName();

            // Set a fresh concrete context (do not read the current one)
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);

            log.debug("Authentication successful for user: {}, generating tokens...", username);

            TokenPairResponse tokens = authService.issueTokensForAuthenticatedUser(username);

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.addHeader(authHeaderName, authHeaderPrefix + tokens.accessToken());

            String jsonResponse = String.format(
                    "{\"accessToken\":\"%s\",\"refreshToken\":\"%s\",\"refreshNonce\":\"%s\",\"tokenType\":\"%s\",\"expiresInSeconds\":%d}",
                    tokens.accessToken(),
                    tokens.refreshToken(),
                    tokens.refreshNonce(),
                    tokens.tokenType(),
                    tokens.expiresInSeconds()
            );

            response.getWriter().write(jsonResponse);
            response.getWriter().flush();

            log.debug("Successfully issued tokens for user: {}", username);

        } catch (Exception e) {
            log.error("Failed to generate tokens for authenticated user: {}", e.getMessage(), e);
            try {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setContentType("application/json");
                String errorResponse = String.format(
                        "{\"error\":\"token_generation_failed\",\"message\":\"Failed to generate authentication tokens\",\"details\":\"%s\",\"timestamp\":%d}",
                        e.getMessage().replace("\"", "'"),
                        System.currentTimeMillis()
                );
                response.getWriter().write(errorResponse);
                response.getWriter().flush();
            } catch (Exception writeException) {
                log.error("Failed to write error response: {}", writeException.getMessage());
            }
        }
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              org.springframework.security.core.AuthenticationException failed) {
        try {
            log.debug("Authentication failed: {}", failed.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            String errorResponse = String.format(
                    "{\"error\":\"authentication_failed\",\"message\":\"%s\",\"timestamp\":%d}",
                    failed.getMessage().replace("\"", "'"),
                    System.currentTimeMillis()
            );
            response.getWriter().write(errorResponse);
            response.getWriter().flush();
        } catch (Exception e) {
            log.error("Failed to write unsuccessful authentication response: {}", e.getMessage());
        }
    }
}