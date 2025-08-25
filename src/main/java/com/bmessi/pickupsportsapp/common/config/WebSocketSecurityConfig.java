package com.bmessi.pickupsportsapp.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

/**
 * Security chain only for the WebSocket HTTP handshake.
 * Matches /ws and anything under it (/ws/**), permits all.
 * STOMP CONNECT will still be authenticated by WebSocketJwtAuthInterceptor.
 */
@Configuration
public class WebSocketSecurityConfig {

    @Bean
    @Order(0) // runs BEFORE the main chain
    public SecurityFilterChain websocketSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(new RegexRequestMatcher("^/ws(?:/.*)?$", null))
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}
