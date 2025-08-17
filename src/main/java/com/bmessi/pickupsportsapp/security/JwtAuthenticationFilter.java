package com.bmessi.pickupsportsapp.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Collections;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService tokenService;
    private final String authHeaderName;
    private final String authHeaderPrefix;

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager,
                                   UserDetailsService userDetailsService,
                                   JwtTokenService tokenService,
                                   String loginUrl,
                                   String authHeaderName,
                                   String authHeaderPrefix) {
        this.authenticationManager = authenticationManager;
        // userDetailsService no longer needed here for token issuance
        this.tokenService = tokenService;
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
            // Use the authenticated principal instead of reloading from DB
            Object principal = auth.getPrincipal();
            String username;
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails ud) {
                username = ud.getUsername();
            } else {
                username = auth.getName();
            }

            String token = tokenService.generate(username);

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.addHeader(authHeaderName, authHeaderPrefix + token);
            response.getWriter().write("{\"token\":\"" + token + "\"}");
            response.getWriter().flush();
            log.debug("JWT issued for user {}", username);
        } catch (Exception e) {
            throw new AuthenticationServiceException("Failed to generate token", e);
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