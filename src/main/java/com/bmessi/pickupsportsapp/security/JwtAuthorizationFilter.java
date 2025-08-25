package com.bmessi.pickupsportsapp.security;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bmessi.pickupsportsapp.repository.RevokedTokenRepository;

import java.io.IOException;

public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthorizationFilter.class);

    private final UserDetailsService userDetailsService;
    private final JwtTokenService tokenService;
    private final RevokedTokenRepository revokedTokenRepository;
    private final String authHeaderName;
    private final String authHeaderPrefix;

    public JwtAuthorizationFilter(UserDetailsService userDetailsService,
                                  JwtTokenService tokenService,
                                  RevokedTokenRepository revokedTokenRepository,
                                  String authHeaderName,
                                  String authHeaderPrefix) {
        this.userDetailsService = userDetailsService;
        this.tokenService = tokenService;
        this.revokedTokenRepository = revokedTokenRepository;
        this.authHeaderName = (authHeaderName == null || authHeaderName.isBlank()) ? "Authorization" : authHeaderName;
        this.authHeaderPrefix = (authHeaderPrefix == null || authHeaderPrefix.isBlank()) ? "Bearer " : authHeaderPrefix;
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return true;
    }

    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        return true;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path != null && (path.equals("/ws") || path.startsWith("/ws/")
                || path.startsWith("/app/") || path.startsWith("/topic/"))) {
            return true;
        }
        String upgrade = request.getHeader("Upgrade");
        if (upgrade != null && "websocket".equalsIgnoreCase(upgrade)) return true;
        String conn = request.getHeader("Connection");
        if (conn != null && conn.toLowerCase().contains("upgrade")) return true;
        if (request.getHeader("Sec-WebSocket-Key") != null) return true;

        return request.getDispatcherType() == DispatcherType.ERROR;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader(authHeaderName);
        if (header == null || header.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        String pfx = authHeaderPrefix;
        boolean hasPrefix = header.regionMatches(true, 0, pfx, 0, pfx.length());
        if (!hasPrefix) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(pfx.length()).trim();
        if (token.isEmpty()) {
            chain.doFilter(request, response);
            return;
        }

        try {
            var claims = tokenService.parse(token).getPayload();
            String jti = claims.getId();
            if (jti != null && revokedTokenRepository.existsById(jti)) {
                SecurityContextHolder.clearContext();
            } else {
                String username = claims.getSubject();
                if (username != null && !username.isBlank()) {
                    var userDetails = userDetailsService.loadUserByUsername(username);
                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(auth);
                    SecurityContextHolder.setContext(context);
                }
            }
        } catch (ExpiredJwtException eje) {
            SecurityContextHolder.clearContext();
            // Do not write response here; let authorization rules decide 401/403 later
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}