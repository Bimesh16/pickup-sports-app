package com.bmessi.pickupsportsapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public class JwtTokenService {

    private final SecretKey key;
    private final String issuer;
    private final String audience;
    private final long expMinutes;

    public JwtTokenService(SecretKey key, String issuer, String audience, long expMinutes) {
        this.key = key;
        this.issuer = issuer;
        this.audience = audience;
        this.expMinutes = expMinutes;
    }

    public String generate(String subject) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subject)
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expMinutes, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .requireIssuer(issuer)
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }
}
