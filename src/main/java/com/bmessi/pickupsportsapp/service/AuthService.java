package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.entity.RefreshToken;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.RefreshTokenRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenService tokenService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    // Provide a sane default (e.g., 15 minutes) so missing config doesn't crash startup
    @Value("${security.jwt.expiration-minutes:15}")
    private int accessTokenMinutes;

    @Value("${security.jwt.refresh.expiration-days:14}")
    private int refreshDays;

    private static final SecureRandom RNG = new SecureRandom();

    @Transactional
    public TokenPairResponse issueTokensForAuthenticatedUser(String username) {
        if (username == null || username.isBlank()) {
            throw new BadCredentialsException("User not found");
        }
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String accessToken = tokenService.generate(user.getUsername());
        String refreshToken = generateOpaqueToken();

        try {
            storeRefresh(user, refreshToken);
        } catch (DataAccessException dae) {
            throw new IllegalStateException("Failed to generate authentication tokens: refresh token persistence error", dae);
        }

        return new TokenPairResponse(accessToken, refreshToken, "Bearer", accessTokenMinutes * 60L);
    }

    @Transactional
    public TokenPairResponse refresh(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        String tokenHash = sha256(refreshTokenValue);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        boolean revoked = stored.getRevokedAt() != null;
        boolean expired = stored.getExpiresAt() != null && Instant.now().isAfter(stored.getExpiresAt());

        if (revoked) {
            handleReuseIfApplicable(stored);
            throw new BadCredentialsException("Refresh token is not active");
        }
        if (expired) {
            throw new BadCredentialsException("Refresh token is not active");
        }

        try {
            return issueNewPair(stored);
        } catch (OptimisticLockingFailureException e) {
            throw new BadCredentialsException("Invalid refresh token");
        } catch (DataAccessException dae) {
            throw new IllegalStateException("Failed to generate authentication tokens: refresh token persistence error", dae);
        }
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            return;
        }
        String tokenHash = sha256(refreshTokenValue);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(stored -> {
            if (stored.getRevokedAt() == null) {
                stored.setRevokedAt(Instant.now());
                refreshTokenRepository.save(stored);
            }
        });
    }

    // --- Internal helpers ---

    private TokenPairResponse issueNewPair(RefreshToken current) {
        User user = current.getUser();

        String newAccessToken = tokenService.generate(user.getUsername());
        String newRefreshTokenValue = generateOpaqueToken();

        String newRefreshHash = storeRefresh(user, newRefreshTokenValue);

        current.setRevokedAt(Instant.now());
        current.setReplacedByTokenHash(newRefreshHash);
        refreshTokenRepository.save(current);

        return new TokenPairResponse(newAccessToken, newRefreshTokenValue, "Bearer", accessTokenMinutes * 60L);
    }

    private void handleReuseIfApplicable(RefreshToken revokedToken) {
        String replacedBy = revokedToken.getReplacedByTokenHash();
        if (replacedBy != null && !replacedBy.isBlank()) {
            refreshTokenRepository.findByTokenHash(replacedBy).ifPresent(next -> {
                if (next.getRevokedAt() == null) {
                    next.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(next);
                }
            });
        }
    }

    private String storeRefresh(User user, String refreshValue) {
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(sha256(refreshValue))
                .expiresAt(Instant.now().plus(Duration.ofDays(refreshDays)))
                .build();
        refreshTokenRepository.save(rt);
        return rt.getTokenHash();
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot hash value", e);
        }
    }

    private static String generateOpaqueToken() {
        byte[] bytes = new byte[64]; // 512-bit random
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}