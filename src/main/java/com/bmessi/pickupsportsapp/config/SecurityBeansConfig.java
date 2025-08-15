package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.config.properties.CorsProperties;
import com.bmessi.pickupsportsapp.config.properties.JwtProperties;
import com.bmessi.pickupsportsapp.config.properties.XaiProperties;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import io.jsonwebtoken.security.Keys;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.Assert;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class, XaiProperties.class})
public class SecurityBeansConfig {

    // Creates HMAC key from configured secret (raw string). For Base64 secrets, decode first.
    @Bean
    public SecretKey jwtSecretKey(JwtProperties props) {
        Assert.hasText(props.secret(), "security.jwt.secret must not be empty");
        byte[] keyBytes = props.secret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Bean
    public JwtTokenService jwtTokenService(JwtProperties props, SecretKey jwtSecretKey) {
        return new JwtTokenService(jwtSecretKey, props.issuer(), props.audience(), props.expirationMinutes());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties props) {
        CorsConfiguration config = new CorsConfiguration();

        // Comma-separated configuration -> list
        config.setAllowedOrigins(Arrays.stream(props.allowedOrigins().split(",")).map(String::trim).toList());
        config.setAllowedMethods(Arrays.stream(props.allowedMethods().split(",")).map(String::trim).toList());
        config.setAllowedHeaders(Arrays.stream(props.allowedHeaders().split(",")).map(String::trim).toList());
        config.setExposedHeaders(Arrays.stream(props.exposedHeaders().split(",")).map(String::trim).toList());
        config.setAllowCredentials(props.allowCredentials());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
