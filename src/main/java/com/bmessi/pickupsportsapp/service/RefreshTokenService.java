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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.refresh-token-expiration:604800}") // default 7 days
    private long refreshTokenDuration;

    public TokenWithNonce createToken(User user) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        String rawNonce = UUID.randomUUID().toString();
        String tokenHash = hash(rawToken);
        String nonceHash = hash(rawNonce);

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .nonceHash(nonceHash)
                .expiresAt(Instant.now().plusSeconds(refreshTokenDuration))
                .build();

        refreshTokenRepository.save(token);

        return new TokenWithNonce(rawToken, rawNonce);
    }

    public RefreshToken validate(String rawToken, String rawNonce) {
        String hash = hash(rawToken);

        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!token.isActive()) {
            throw new BadCredentialsException("Refresh token expired or revoked");
        }

        String nonceHash = hash(rawNonce);
        if (!nonceHash.equals(token.getNonceHash())) {
            throw new BadCredentialsException("Invalid refresh token nonce");
        }

        return token;
    }

    public TokenWithNonce rotate(RefreshToken current) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        String rawNonce = UUID.randomUUID().toString();
        String newTokenHash = hash(rawToken);
        String newNonceHash = hash(rawNonce);

        RefreshToken next = RefreshToken.builder()
                .user(current.getUser())
                .tokenHash(newTokenHash)
                .nonceHash(newNonceHash)
                .expiresAt(Instant.now().plusSeconds(refreshTokenDuration))
                .build();
        refreshTokenRepository.save(next);

        current.setRevokedAt(Instant.now());
        current.setReplacedByTokenHash(newTokenHash);
        current.setLastUsedAt(Instant.now());
        refreshTokenRepository.save(current);

        return new TokenWithNonce(rawToken, rawNonce);
    }

    public void revokeByTokenValue(String rawToken) {
        String hash = hash(rawToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            }
        });
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

    public record TokenWithNonce(String token, String nonce) {}
}
