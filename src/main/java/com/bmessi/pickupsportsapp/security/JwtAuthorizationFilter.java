package com.bmessi.pickupsportsapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthorizationFilter.class);

    private final UserDetailsService userDetailsService;
    private final JwtTokenService tokenService;
    private final String authHeaderName;
    private final String authHeaderPrefix;

    public JwtAuthorizationFilter(UserDetailsService userDetailsService,
                                  JwtTokenService tokenService,
                                  String authHeaderName,
                                  String authHeaderPrefix) {
        this.userDetailsService = userDetailsService;
        this.tokenService = tokenService;
        this.authHeaderName = authHeaderName;
        this.authHeaderPrefix = authHeaderPrefix != null ? authHeaderPrefix : "Bearer ";
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(authHeaderName);
        if (header != null && header.startsWith(authHeaderPrefix)) {
            String token = header.substring(authHeaderPrefix.length());

            try {
                var claims = tokenService.parse(token).getPayload();
                String username = claims.getSubject();

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    var user = userDetailsService.loadUserByUsername(username);
                    if (user != null) {
                        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.trace("Security context set for user {}", username);
                    }
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                log.debug("JWT validation failed: {}", e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}