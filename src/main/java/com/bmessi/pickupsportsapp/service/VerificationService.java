package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.common.config.properties.AuthFlowProperties;
import com.bmessi.pickupsportsapp.entity.VerificationToken;
import com.bmessi.pickupsportsapp.entity.VerifiedUser;
import com.bmessi.pickupsportsapp.repository.VerificationTokenRepository;
import com.bmessi.pickupsportsapp.repository.VerifiedUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private static final SecureRandom RNG = new SecureRandom();

    private final VerificationTokenRepository tokenRepo;
    private final VerifiedUserRepository verifiedRepo;
    private final AuthFlowProperties props;
    private final com.bmessi.pickupsportsapp.security.SecurityAuditService audit;

    @Transactional
    public String createTokenFor(String username) {
        String token = randomToken();
        Instant expires = Instant.now().plus(props.getVerificationTtlHours(), ChronoUnit.HOURS);

        // Optional: delete older tokens for that user
        tokenRepo.deleteByUsername(username);

        VerificationToken vt = VerificationToken.builder()
                .username(username)
                .token(token)
                .expiresAt(expires)
                .build();
        tokenRepo.save(vt);
        return token;
    }

    @Transactional
    public boolean consume(String token) {
        var vt = tokenRepo.findByToken(token).orElse(null);
        if (vt == null) return false;
        if (vt.getConsumedAt() != null) return false;
        if (vt.getExpiresAt().isBefore(Instant.now())) return false;

        vt.setConsumedAt(Instant.now());
        tokenRepo.save(vt);

        if (!verifiedRepo.existsByUsername(vt.getUsername())) {
            verifiedRepo.save(VerifiedUser.builder()
                    .username(vt.getUsername())
                    .verifiedAt(Instant.now())
                    .build());
        }
        // delete remaining tokens for the user
        tokenRepo.deleteByUsername(vt.getUsername());
        try { audit.verificationSucceeded(vt.getUsername()); } catch (Exception ignore) {}
        return true;
    }

    @Transactional(readOnly = true)
    public boolean isVerified(String username) {
        return verifiedRepo.existsByUsername(username);
    }

    private static String randomToken() {
        byte[] bytes = new byte[48]; // 384 bits
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
