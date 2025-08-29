package com.bmessi.pickupsportsapp.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security testing configuration for penetration testing and security validation.
 * 
 * Features:
 * - Security testing endpoints
 * - Vulnerability scanning endpoints
 * - Security header testing
 * - Authentication bypass testing (dev only)
 * - Rate limiting testing
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Configuration
@EnableWebSecurity
@Profile("test-security")
@ConditionalOnProperty(name = "security.testing.enabled", havingValue = "true")
public class SecurityTestingConfig {

    /**
     * Security filter chain for testing purposes.
     * WARNING: This configuration is for security testing only!
     */
    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for testing
            .csrf(csrf -> csrf.disable())
            
            // Allow all requests for security testing
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/security-test/**").permitAll()
                .requestMatchers("/vulnerability-scan/**").permitAll()
                .requestMatchers("/auth-bypass/**").permitAll()
                .requestMatchers("/rate-limit-test/**").permitAll()
                .anyRequest().permitAll()
            )
            
            // Disable security headers for testing
            .headers(headers -> headers.disable())
            
            // Disable session management
            .sessionManagement(session -> session.disable());

        return http.build();
    }
}
