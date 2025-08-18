package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.RefreshToken;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.refresh-token-expiration:604800}") // default 7 days
    private long refreshTokenDuration;

    public String createToken(User user) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        String hash = hash(rawToken);

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(Instant.now().plusSeconds(refreshTokenDuration))
                .build();

        refreshTokenRepository.save(token);

        return rawToken;
    }

    public RefreshToken validate(String rawToken) {
        String hash = hash(rawToken);

        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!token.isActive()) {
            throw new BadCredentialsException("Refresh token expired or revoked");
        }

        return token;
    }

    public void revoke(RefreshToken token, String reason) {
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(token.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
