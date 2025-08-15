package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.config.properties.CorsProperties;
import com.bmessi.pickupsportsapp.config.properties.JwtProperties;
import com.bmessi.pickupsportsapp.security.JwtAuthenticationFilter;
import com.bmessi.pickupsportsapp.security.JwtAuthorizationFilter;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtTokenService tokenService;
    private final JwtProperties jwtProps;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(UserDetailsService userDetailsService,
                          JwtTokenService tokenService,
                          JwtProperties jwtProps,
                          CorsConfigurationSource corsConfigurationSource) {
        this.userDetailsService = userDetailsService;
        this.tokenService = tokenService;
        this.jwtProps = jwtProps;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        var authFilter = new JwtAuthenticationFilter(
                authenticationManager,
                userDetailsService,
                tokenService,
                "/auth/login",
                jwtProps.header(),
                jwtProps.prefix()
        );
        var authorizationFilter = new JwtAuthorizationFilter(
                userDetailsService,
                tokenService,
                jwtProps.header(),
                jwtProps.prefix()
        );

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/users/register", "/sports", "/games/**").permitAll()
                        .requestMatchers("/users/me", "/notifications/**").hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilter(authFilter)
                .addFilterBefore(authorizationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Authentication Failed\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Access Denied\"}");
                        })
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}