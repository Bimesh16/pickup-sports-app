package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.auth.TokenPairResponse;
import com.bmessi.pickupsportsapp.entity.RefreshToken;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenService tokenService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final com.bmessi.pickupsportsapp.security.SecurityAuditService audit;

    // Provide a sane default (e.g., 15 minutes) so missing config doesn't crash startup
    @Value("${security.jwt.expiration-minutes:15}")
    private int accessTokenMinutes;

    // refresh expiration handled in RefreshTokenService

    @Timed(value = "auth.issueTokens", description = "Time to issue tokens for an authenticated user")
    @Transactional
    public TokenPairResponse issueTokensForAuthenticatedUser(String username) {
        if (username == null || username.isBlank()) {
            throw new BadCredentialsException("User not found");
        }
        User user = userRepository.findOptionalByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String accessToken = tokenService.generate(user.getUsername());
        RefreshTokenService.TokenWithNonce refreshPair;
        try {
            refreshPair = refreshTokenService.createToken(user);
        } catch (DataAccessException dae) {
            throw new IllegalStateException("Failed to generate authentication tokens: refresh token persistence error", dae);
        }

        return new TokenPairResponse(accessToken, refreshPair.token(), refreshPair.nonce(), "Bearer", accessTokenMinutes * 60L);
    }

    @Timed(value = "auth.refresh", description = "Time to refresh tokens using refresh token")
    @Transactional
    public TokenPairResponse refresh(String refreshTokenValue, String nonce) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        if (nonce == null || nonce.isBlank()) {
            throw new BadCredentialsException("Invalid refresh token nonce");
        }

        RefreshToken stored = refreshTokenService.validate(refreshTokenValue, nonce);

        try {
            RefreshTokenService.TokenWithNonce pair = refreshTokenService.rotate(stored);
            String newAccessToken = tokenService.generate(stored.getUser().getUsername());
            try { audit.refreshIssued(stored.getUser().getUsername()); } catch (Exception ignore) {}
            try { io.micrometer.core.instrument.Metrics.counter("auth.refresh.success").increment(); } catch (Exception ignore) {}
            return new TokenPairResponse(newAccessToken, pair.token(), pair.nonce(), "Bearer", accessTokenMinutes * 60L);
        } catch (DataAccessException dae) {
            throw new IllegalStateException("Failed to generate authentication tokens: refresh token persistence error", dae);
        }
    }

    @Timed(value = "auth.logout", description = "Time to revoke a refresh token on logout")
    @Transactional
    public void logout(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            return;
        }
        refreshTokenService.revokeByTokenValue(refreshTokenValue);
    }
}