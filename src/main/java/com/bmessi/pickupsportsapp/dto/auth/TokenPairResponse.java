package com.bmessi.pickupsportsapp.dto.auth;

public record TokenPairResponse(
        String accessToken,
        String refreshToken,
        String tokenType,       // "Bearer"
        long expiresInSeconds   // for the access token
) {}