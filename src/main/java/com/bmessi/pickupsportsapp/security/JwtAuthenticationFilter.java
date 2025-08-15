package com.bmessi.pickupsportsapp.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    private static final byte[] SECRET_KEY = "your-secret-key-must-be-at-least-32-characters".getBytes(StandardCharsets.UTF_8);

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager, UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        setFilterProcessesUrl("/auth/login");
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(request.getReader());
            if (jsonNode == null || jsonNode.get("username") == null || jsonNode.get("password") == null) {
                throw new AuthenticationServiceException("Missing username or password");
            }

            String username = jsonNode.get("username").asText(null);
            String password = jsonNode.get("password").asText(null);

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
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication auth) {
        try {
            UserDetails user = userDetailsService.loadUserByUsername(auth.getName());
            String token = Jwts.builder()
                    .subject(user.getUsername())
                    .signWith(Keys.hmacShaKeyFor(SECRET_KEY))
                    .compact();

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.addHeader("Authorization", "Bearer " + token);
            response.getWriter().write("{\"token\":\"Bearer " + token + "\"}");
            response.getWriter().flush();
        } catch (Exception e) {
            throw new AuthenticationServiceException("Failed to generate token", e);
        }
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException failed) {
        try {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"" + failed.getMessage() + "\"}");
            response.getWriter().flush();
        } catch (Exception ignored) {
        }
    }
}