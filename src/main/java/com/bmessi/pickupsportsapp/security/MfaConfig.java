package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.config.properties.LoginPolicyProperties;
import com.bmessi.pickupsportsapp.service.MfaService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security filter enforcing MFA policy for admin users.
 */
@Configuration
public class MfaConfig {

    @Bean
    @Order(SecurityProperties.DEFAULT_FILTER_ORDER + 1)
    public OncePerRequestFilter mfaEnforcementFilter(LoginPolicyProperties policy, MfaService mfaService) {
        return new OncePerRequestFilter() {
            @Override
            protected boolean shouldNotFilter(HttpServletRequest request) {
                String path = request.getRequestURI();
                return path != null && path.startsWith("/auth/");
            }

            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain) throws ServletException, IOException {
                if (policy.isRequireMfaForAdmin()) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated()) {
                        boolean isAdmin = auth.getAuthorities().stream()
                                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
                        if (isAdmin && !mfaService.isEnabled(auth.getName())) {
                            throw new MfaRequiredException("MFA required");
                        }
                    }
                }
                filterChain.doFilter(request, response);
            }
        };
    }
}
