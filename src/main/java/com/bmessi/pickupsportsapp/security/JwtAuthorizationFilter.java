package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.security.JwtTokenService;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthorizationFilter.class);
    private final UserDetailsService userDetailsService;
    private final JwtTokenService tokenService;
    private final String authHeaderName;
    private final String authHeaderPrefix;

    public JwtAuthorizationFilter(UserDetailsService userDetailsService, JwtTokenService tokenService,
                                  String authHeaderName, String authHeaderPrefix) {
        this.userDetailsService = userDetailsService;
        this.tokenService = tokenService;
        this.authHeaderName = authHeaderName;
        this.authHeaderPrefix = authHeaderPrefix != null ? authHeaderPrefix : "Bearer ";
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(authHeaderName);
        if (header == null) {
            log.debug("No authorization header");
            chain.doFilter(request, response);
            return;
        }

        String prefix = authHeaderPrefix;
        // case-insensitive prefix check
        boolean prefixed = header.regionMatches(true, 0, prefix, 0, prefix.length());
        if (!prefixed) {
            log.debug("Authorization header present but prefix did not match");
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(prefix.length()).trim();
        if (token.isEmpty()) {
            log.debug("Authorization header had empty token");
            chain.doFilter(request, response);
            return;
        }

        try {
            var claims = tokenService.parse(token).getPayload();
            String username = claims.getSubject();
            if (username == null || username.isBlank()) {
                log.warn("JWT subject is missing");
                chain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                var userDetails = userDetailsService.loadUserByUsername(username);
                var authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated user");
            }
        } catch (ExpiredJwtException eje) {
            // Do not log raw token
            log.info("JWT expired");
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("WWW-Authenticate",
                    "Bearer error=\"invalid_token\", error_description=\"The access token expired\"");
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"invalid_token\",\"message\":\"access token expired\"}");
            return; // stop the filter chain on expired token
        } catch (Exception e) {
            // Keep context clean and continue; downstream security will handle protected endpoints
            log.warn("JWT validation failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}