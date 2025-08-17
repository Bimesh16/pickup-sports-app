package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.entity.RefreshToken;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.RefreshTokenRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenService tokenService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.expiration-minutes}")
    private int accessTokenMinutes;

    // Default 14 days if not configured
    @Value("${security.jwt.refresh.expiration-days:14}")
    private int refreshDays;

    private static final SecureRandom RNG = new SecureRandom();

    public TokenPairResponse issueTokensForAuthenticatedUser(String username) {
        User user = Optional.ofNullable(userRepository.findByUsername(username))
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String access = tokenService.generate(user.getUsername());
        String refresh = generateOpaqueToken();
        storeRefresh(user, refresh);

        return new TokenPairResponse(access, refresh, "Bearer", accessTokenMinutes * 60L);
    }

    public TokenPairResponse refresh(String refreshTokenValue) {
        var hash = sha256(refreshTokenValue);
        var rt = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!rt.isActive()) {
            throw new BadCredentialsException("Refresh token is not active");
        }

        User user = rt.getUser();

        // Rotate: revoke old, issue new
        rt.setRevokedAt(OffsetDateTime.now());

        String access = tokenService.generate(user.getUsername());
        String newRefresh = generateOpaqueToken();
        String newHash = storeRefresh(user, newRefresh);
        rt.setReplacedByTokenHash(newHash);
        refreshTokenRepository.save(rt);

        return new TokenPairResponse(access, newRefresh, "Bearer", accessTokenMinutes * 60L);
    }

    public void logout(String refreshTokenValue) {
        var hash = sha256(refreshTokenValue);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(stored -> {
            if (stored.getRevokedAt() == null) {
                stored.setRevokedAt(OffsetDateTime.now());
                refreshTokenRepository.save(stored);
            }
        });
    }

    private String storeRefresh(User user, String refreshValue) {
        var rt = RefreshToken.builder()
                .user(user)
                .tokenHash(sha256(refreshValue))
                .expiresAt(OffsetDateTime.now().plusDays(refreshDays))
                .build();
        refreshTokenRepository.save(rt);
        return rt.getTokenHash();
    }

    private static String sha256(String value) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
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