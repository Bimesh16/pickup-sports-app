package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.security.JwtAuthenticationFilter;
import com.bmessi.pickupsportsapp.security.JwtAuthorizationFilter;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import com.bmessi.pickupsportsapp.service.AuthService;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
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

    // Default chain: protects REST API with JWT, disables anonymous to avoid deferred-context recursion
    @Bean
    public SecurityFilterChain apiChain(HttpSecurity http,
                                        UserDetailsService userDetailsService,
                                        JwtTokenService jwtTokenService,
                                        AuthenticationManager authenticationManager,
                                        AuthService authService) throws Exception {

        var jwtAuthz = new JwtAuthorizationFilter(userDetailsService, jwtTokenService, AUTH_HEADER_NAME, AUTH_HEADER_PREFIX);
        var jwtAuthn = new JwtAuthenticationFilter(authenticationManager, authService,
                "/auth/login", AUTH_HEADER_NAME, AUTH_HEADER_PREFIX);

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .anonymous(a -> a.disable())
                .authorizeHttpRequests(auth -> auth
                        // Allow CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // static and SPA entry
                    .requestMatchers("/", "/index.html", "/chat-test.html").permitAll()
                    .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                    // API docs and health
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                    .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                    // error endpoint (allow internal forwards without authentication)
                    .requestMatchers("/error").permitAll()
                        // public REST
                        .requestMatchers("/auth/**", "/users/register", "/sports", "/games", "/games/**").permitAll()
                        // everything else
                        .anyRequest().authenticated()
                )
                // place login filter at the UsernamePasswordAuthenticationFilter slot
                .addFilterAt(jwtAuthn, UsernamePasswordAuthenticationFilter.class)
                // validate JWT before username/password auth
                .addFilterBefore(jwtAuthz, UsernamePasswordAuthenticationFilter.class)
                // send 401 instead of redirecting (no internal forward loop)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

        return http.build();
    }
}