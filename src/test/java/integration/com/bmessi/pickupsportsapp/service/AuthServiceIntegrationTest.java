package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.entity.auth.RefreshToken;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.RefreshTokenRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.auth.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ActiveProfiles;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.springframework.security.authentication.BadCredentialsException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceIntegrationTest {

    @Configuration
    static class TestConfig {
        @Bean
        MeterRegistry meterRegistry() {
            return new SimpleMeterRegistry();
        }
    }

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    void issueTokens_persistsRefreshToken() {
        User user = userRepository.save(User.builder().username("alice@example.com").password("pw").build());
        TokenPairResponse pair = authService.issueTokensForAuthenticatedUser(user.getUsername());
        assertNotNull(pair.accessToken());
        assertNotNull(pair.refreshToken());
        assertNotNull(pair.refreshNonce());
        assertFalse(refreshTokenRepository.findByUser_UsernameAndRevokedAtIsNull(user.getUsername()).isEmpty());
    }

    @Test
    void issueTokens_invalidUserThrows() {
        assertThrows(BadCredentialsException.class, () -> authService.issueTokensForAuthenticatedUser("missing"));
    }

    @Test
    void refresh_replacesOldToken() {
        User user = userRepository.save(User.builder().username("bob@example.com").password("pw").build());
        TokenPairResponse original = authService.issueTokensForAuthenticatedUser(user.getUsername());
        TokenPairResponse refreshed = authService.refresh(original.refreshToken(), original.refreshNonce());
        assertNotEquals(original.accessToken(), refreshed.accessToken());
        RefreshToken oldToken = refreshTokenRepository.findByTokenHash(hash(original.refreshToken())).orElseThrow();
        assertNotNull(oldToken.getRevokedAt());
    }

    @Test
    void logout_revokesToken() {
        User user = userRepository.save(User.builder().username("carol@example.com").password("pw").build());
        TokenPairResponse pair = authService.issueTokensForAuthenticatedUser(user.getUsername());
        authService.logout(pair.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash(pair.refreshToken())).orElseThrow();
        assertNotNull(stored.getRevokedAt());
    }

    private static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
