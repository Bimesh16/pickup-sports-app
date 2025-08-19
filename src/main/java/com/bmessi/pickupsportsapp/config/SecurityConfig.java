package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.security.JwtAuthenticationFilter;
import com.bmessi.pickupsportsapp.security.JwtAuthorizationFilter;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import com.bmessi.pickupsportsapp.service.AuthService;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private static final String AUTH_HEADER_NAME   = "Authorization";
    private static final String AUTH_HEADER_PREFIX = "Bearer ";

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   UserDetailsService userDetailsService,
                                                   JwtTokenService jwtTokenService,
                                                   AuthenticationManager authenticationManager,
                                                   AuthService authService) throws Exception {

        var jwtAuthorizationFilter =
                new JwtAuthorizationFilter(userDetailsService, jwtTokenService, AUTH_HEADER_NAME, AUTH_HEADER_PREFIX);

        var jwtAuthenticationFilter =
                new JwtAuthenticationFilter(authenticationManager, authService,
                        "/auth/login", AUTH_HEADER_NAME, AUTH_HEADER_PREFIX);

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/users/register", "/sports", "/games", "/games/**").permitAll()
                        .requestMatchers("/ws/**", "/topic/**", "/app/**").permitAll()
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll() // static assets
                        .requestMatchers("/chat-test.html", "/error", "/media/**").permitAll()
                        .requestMatchers("/notifications/**").authenticated()
                        .anyRequest().authenticated()
                )
                // place the login filter
                .addFilterAt(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // validate JWT before username/password auth
                .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)
                // return 401 instead of redirecting to login page
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

        return http.build();
    }
}
