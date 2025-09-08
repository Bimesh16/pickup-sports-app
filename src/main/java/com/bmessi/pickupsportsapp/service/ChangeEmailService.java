package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.config.properties.AuthFlowProperties;
import com.bmessi.pickupsportsapp.entity.EmailChangeToken;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.VerifiedUser;
import com.bmessi.pickupsportsapp.repository.EmailChangeTokenRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.VerifiedUserRepository;
import com.bmessi.pickupsportsapp.security.SecurityAuditService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ChangeEmailService {

    private static final SecureRandom RNG = new SecureRandom();

    private final EmailChangeTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final VerifiedUserRepository verifiedRepo;
    private final Optional<EmailService> emailService;
    private final AuthFlowProperties props;
    private final SecurityAuditService audit;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public void requestChange(String username, String newEmail, String requesterIp) {
        User user = userRepo.findByUsername(username);
        if (user == null) return;

        // Clear any existing pending tokens
        tokenRepo.deleteByUsername(username);

        String token = randomToken();
        EmailChangeToken ect = EmailChangeToken.builder()
                .username(username)
                .newEmail(newEmail)
                .token(token)
                .expiresAt(Instant.now().plus(props.getVerificationTtlHours(), ChronoUnit.HOURS))
                .requestedIp(requesterIp)
                .build();
        tokenRepo.save(ect);

        String base = props.getAppUrl();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        String link = base + "/auth/change-email/confirm?token=" + token;
        try {
            emailService.ifPresent(es -> {
                try {
                    es.sendChangeEmailVerification(newEmail, link);
                } catch (Exception ignore) {}
            });
            audit.emailChangeRequested(username, newEmail);
        } catch (Exception ignore) {}
    }

    @Transactional
    public boolean confirm(String token) {
        EmailChangeToken ect = tokenRepo.findByToken(token).orElse(null);
        if (ect == null) return false;
        if (ect.getConsumedAt() != null) return false;
        if (ect.getExpiresAt().isBefore(Instant.now())) return false;

        User user = userRepo.findByUsername(ect.getUsername());
        if (user == null) return false;

        String oldEmail = user.getUsername();
        user.setUsername(ect.getNewEmail());
        userRepo.save(user);

        // Mark new email as verified
        if (!verifiedRepo.existsByUsername(ect.getNewEmail())) {
            verifiedRepo.save(VerifiedUser.builder()
                    .username(ect.getNewEmail())
                    .verifiedAt(Instant.now())
                    .build());
        }

        // Invalidate sessions (revoke refresh tokens) if configured
        if (props.isChangeEmailInvalidateSessions()) {
            em.createQuery("update RefreshToken rt set rt.revokedAt = :now where rt.user = :user and rt.revokedAt is null")
                    .setParameter("now", Instant.now())
                    .setParameter("user", user)
                    .executeUpdate();
        }

        ect.setConsumedAt(Instant.now());
        tokenRepo.save(ect);
        tokenRepo.deleteByUsername(oldEmail);

        audit.emailChangeConfirmed(oldEmail, ect.getNewEmail());
        return true;
    }

    private static String randomToken() {
        byte[] b = new byte[48];
        RNG.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}
