package com.bmessi.pickupsportsapp.security;

import io.jsonwebtoken.*;
import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;

public class JwtTokenService {

    private static final Duration DEFAULT_CLOCK_SKEW = Duration.ofMinutes(2);

    private final SecretKey signingKey;
    private final String issuer;
    private final String audience;
    private final Duration expiration;
    private final Duration clockSkew;
    private final JwtParser parser;

    // Backward-compatible constructor delegates to the new one with default clock skew.
    public JwtTokenService(SecretKey key, String issuer, String audience, long expirationMinutes) {
        this(key, issuer, audience, expirationMinutes, DEFAULT_CLOCK_SKEW);
    }

    // New constructor that allows configuring clock skew.
    public JwtTokenService(SecretKey key, String issuer, String audience, long expirationMinutes, Duration clockSkew) {
        this.signingKey = Objects.requireNonNull(key, "signingKey must not be null");
        this.issuer = Objects.requireNonNull(issuer, "issuer must not be null");
        this.audience = Objects.requireNonNull(audience, "audience must not be null");
        this.clockSkew = Objects.requireNonNull(clockSkew, "clockSkew must not be null");
        if (issuer.isBlank()) throw new IllegalArgumentException("issuer must not be blank");
        if (audience.isBlank()) throw new IllegalArgumentException("audience must not be blank");
        if (expirationMinutes <= 0) throw new IllegalArgumentException("expiration minutes must be > 0");
        if (this.clockSkew.isNegative()) throw new IllegalArgumentException("clockSkew must not be negative");

        this.expiration = Duration.ofMinutes(expirationMinutes);
        this.parser = buildParser();
    }

    public String generateWithClaims(String subject, java.util.Map<String, Object> extraClaims) {
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("subject must not be null or blank");
        }
        java.time.Instant now = java.time.Instant.now();
        java.util.Date issuedAt = java.util.Date.from(now);
        java.util.Date expiresAt = java.util.Date.from(now.plus(expiration));

        var builder = Jwts.builder()
                .subject(subject)
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(issuedAt)
                .expiration(expiresAt);

        if (extraClaims != null) {
            extraClaims.forEach(builder::claim);
        }
        return builder.signWith(signingKey).compact();
    }

    private JwtParser buildParser() {
        // Build and cache a parser with all invariants configured once.
        return Jwts.parser()
                .requireIssuer(this.issuer)
                .requireAudience(this.audience)
                .clockSkewSeconds(this.clockSkew.getSeconds())
                .verifyWith(this.signingKey)
                .build();
    }

    public String generate(String subject) {
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("subject must not be null or blank");
        }
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date expiresAt = Date.from(now.plus(expiration));

        return Jwts.builder()
                .subject(subject)
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(signingKey)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("token must not be null or blank");
        }
        return parser.parseSignedClaims(token);
    }
}