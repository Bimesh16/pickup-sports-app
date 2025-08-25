package com.bmessi.pickupsportsapp.common.config;

import com.bmessi.pickupsportsapp.common.config.properties.CorsProperties;
import com.bmessi.pickupsportsapp.common.config.properties.JwtProperties;
import com.bmessi.pickupsportsapp.common.config.properties.XaiProperties;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import io.jsonwebtoken.io.Decoders;
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
import java.security.MessageDigest;
import java.util.Arrays;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class, XaiProperties.class})
public class SecurityBeansConfig {

    @Bean
    public SecretKey jwtSecretKey(JwtProperties props) {
        Assert.hasText(props.secret(), "security.jwt.secret must not be empty");
        String s = props.secret().trim();

        byte[] keyBytes;
        try {
            // Heuristic detection:
            if (s.matches("^[A-Za-z0-9_-]+={0,2}$") && (s.contains("-") || s.contains("_"))) {
                // Base64URL (e.g., has '-' or '_')
                keyBytes = Decoders.BASE64URL.decode(s);
            } else if (s.matches("^[A-Za-z0-9+/]+={0,2}$") && (s.contains("+") || s.contains("/") || s.endsWith("="))) {
                // Standard Base64
                keyBytes = Decoders.BASE64.decode(s);
            } else {
                // Plain passphrase → hash to 256-bit so HS256 has a strong key
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                keyBytes = sha256.digest(s.getBytes(StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JWT secret format", e);
        }

        if (keyBytes.length < 32) {
            // Extremely unlikely after hashing, but keep a guard in case of broken input
            throw new IllegalArgumentException("Derived JWT key is too short (<32 bytes). Provide a longer secret.");
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Bean
    public JwtTokenService jwtTokenService(JwtProperties props, SecretKey jwtSecretKey) {
        return new JwtTokenService(jwtSecretKey, props.issuer(), props.audience(), props.expirationMinutes());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties props) {
        CorsConfiguration config = new CorsConfiguration();
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
