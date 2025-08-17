package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.security.JwtTokenService;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
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
        this.authHeaderPrefix = authHeaderPrefix;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(authHeaderName);
        log.debug("Authorization header: {}", header);
        if (header != null && header.startsWith(authHeaderPrefix)) {
            String token = header.substring(authHeaderPrefix.length());
            try {
                var claims = tokenService.parse(token).getPayload();
                String username = claims.getSubject();
                log.debug("JWT parsed, username: {}", username);
                var userDetails = userDetailsService.loadUserByUsername(username);
                var authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated user: {}", username);
            } catch (ExpiredJwtException eje) {
                log.info("JWT expired for token: {}", token);
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setHeader("WWW-Authenticate", "Bearer error=\"invalid_token\", error_description=\"The access token expired\"");
                response.getWriter().write("Unauthorized: access token expired");
                return; // stop the filter chain on expired token
            } catch (Exception e) {
                log.warn("JWT validation failed for token: {}, error: {}", token, e.getMessage());
                SecurityContextHolder.clearContext();
                // Let the chain continue; endpoints requiring auth will be rejected by Spring Security
            }
        } else {
            log.debug("No valid JWT header found");
        }
        chain.doFilter(request, response);
    }
}