package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.SocialAccount;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.SocialAccountRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.VerifiedUserRepository;
import com.bmessi.pickupsportsapp.security.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class SocialAuthService {

    private final JwksVerifierService jwks;

    private final String googleIssuer;
    private final String googleAudience;
    private final String googleJwks;

    private final String appleIssuer;
    private final String appleAudience;
    private final String appleJwks;

    private final UserRepository users;
    private final SocialAccountRepository socialAccounts;
    private final VerifiedUserRepository verifiedUsers;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom RNG = new SecureRandom();

    public SocialAuthService(
            JwksVerifierService jwks,
            @Value("${oauth.google.issuer:https://accounts.google.com}") String googleIssuer,
            @Value("${oauth.google.audience:}") String googleAudience,
            @Value("${oauth.google.jwks:https://www.googleapis.com/oauth2/v3/certs}") String googleJwks,
            @Value("${oauth.apple.issuer:https://appleid.apple.com}") String appleIssuer,
            @Value("${oauth.apple.audience:}") String appleAudience,
            @Value("${oauth.apple.jwks:https://appleid.apple.com/auth/keys}") String appleJwks,
            UserRepository users,
            SocialAccountRepository socialAccounts,
            VerifiedUserRepository verifiedUsers,
            PasswordEncoder passwordEncoder
    ) {
        this.jwks = jwks;
        this.googleIssuer = googleIssuer;
        this.googleAudience = googleAudience;
        this.googleJwks = googleJwks;
        this.appleIssuer = appleIssuer;
        this.appleAudience = appleAudience;
        this.appleJwks = appleJwks;
        this.users = users;
        this.socialAccounts = socialAccounts;
        this.verifiedUsers = verifiedUsers;
        this.passwordEncoder = passwordEncoder;
    }

    // Backward-compatible method (still used in some flows)
    public String verifyAndResolveUsername(String provider, String token) {
        return loginOrLink(provider, token);
    }

    // Verify token, then link to existing user or provision a new one; return username.
    @Transactional
    public String loginOrLink(String provider, String token) {
        if (provider == null || token == null || token.isBlank()) return null;
        Claims claims = verifyClaims(provider, token);
        if (claims == null) return null;

        String sub = claims.get("sub", String.class);
        String email = Optional.ofNullable(claims.get("email")).map(Object::toString).orElse(null);
        boolean emailVerified = Optional.ofNullable(claims.get("email_verified"))
                .map(Object::toString).map(Boolean::parseBoolean).orElse(true);

        // Already linked?
        Optional<SocialAccount> existing = socialAccounts.findByProviderAndSubject(provider.toLowerCase(), sub);
        if (existing.isPresent()) {
            return existing.get().getUser().getUsername();
        }

        // Link by email if a user exists
        User user = null;
        if (email != null) {
            user = users.findByUsername(email);
        }
        if (user == null) {
            // Provision new user
            String username = (email != null && !email.isBlank()) ? email : (provider.toLowerCase() + "+" + randomToken() + "@example.local");
            String randomPwd = passwordEncoder.encode(randomToken());
            user = User.builder()
                    .username(username)
                    .password(randomPwd)
                    .roles(java.util.EnumSet.of(User.Role.USER))
                    .build();
            users.save(user);
        }

        // Mark email verified for social sign-in
        if (emailVerified && email != null) {
            if (!verifiedUsers.existsByUsername(user.getUsername())) {
                verifiedUsers.save(com.bmessi.pickupsportsapp.entity.VerifiedUser.builder()
                        .username(user.getUsername())
                        .verifiedAt(java.time.Instant.now())
                        .build());
            }
        }

        // Create link
        SocialAccount sa = SocialAccount.builder()
                .provider(provider.toLowerCase())
                .subject(sub)
                .email(email)
                .user(user)
                .build();
        socialAccounts.save(sa);
        return user.getUsername();
    }

    private Claims verifyClaims(String provider, String token) {
        try {
            if ("google".equalsIgnoreCase(provider)) {
                Jws<Claims> jws = jwks.verify(token, googleIssuer, googleAudience, googleJwks);
                return jws.getPayload();
            } else if ("apple".equalsIgnoreCase(provider)) {
                Jws<Claims> jws = jwks.verify(token, appleIssuer, appleAudience, appleJwks);
                return jws.getPayload();
            }
        } catch (Exception ignore) {}
        return null;
    }

    private static String randomToken() {
        byte[] bytes = new byte[16];
        RNG.nextBytes(bytes);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
