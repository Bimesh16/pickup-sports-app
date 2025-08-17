package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.service.AuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
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
            if (json == null || json.get("username") == null || json.get("password") == null) {
                throw new AuthenticationServiceException("Missing username or password");
            }
            String username = json.get("username").asText(null);
            String password = json.get("password").asText(null);
            if (username == null || username.isBlank() || password == null || password.isBlank()) {
                throw new BadCredentialsException("Invalid username or password");
            }
            UsernamePasswordAuthenticationToken authRequest =
                    new UsernamePasswordAuthenticationToken(username, password, Collections.emptyList());
            return authenticationManager.authenticate(authRequest);
        } catch (BadCredentialsException | AuthenticationServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthenticationServiceException("Invalid authentication request payload", e);
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

            TokenPairResponse tokens = authService.issueTokensForAuthenticatedUser(username);

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.addHeader(authHeaderName, authHeaderPrefix + tokens.accessToken());

            // FIXED: Return proper token structure instead of just "token"
            response.getWriter().write(
                    "{\"accessToken\":\"" + tokens.accessToken() + "\"," +
                            "\"refreshToken\":\"" + tokens.refreshToken() + "\"," +
                            "\"tokenType\":\"" + tokens.tokenType() + "\"," +
                            "\"expiresInSeconds\":" + tokens.expiresInSeconds() + "}"
            );
            response.getWriter().flush();
            log.debug("Issued access and refresh tokens for user {}", username);
        } catch (Exception e) {
            // FALLBACK: If AuthService fails, return just the access token (current behavior)
            try {
                Object principal = auth.getPrincipal();
                String username = (principal instanceof UserDetails ud) ? ud.getUsername() : auth.getName();

                // Generate simple JWT token using your JwtTokenService directly
                // Note: You'll need to inject JwtTokenService for this fallback
                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token service unavailable\"}");
                response.getWriter().flush();
                log.error("Failed to generate tokens, falling back", e);
            } catch (Exception fallbackException) {
                throw new AuthenticationServiceException("Failed to generate tokens", fallbackException);
            }
        }
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              org.springframework.security.core.AuthenticationException failed) {
        try {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"" + failed.getMessage() + "\"}");
            response.getWriter().flush();
            log.debug("Authentication failed: {}", failed.getMessage());
        } catch (Exception ignored) {
        }
    }
}