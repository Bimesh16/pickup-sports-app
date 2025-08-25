package com.bmessi.pickupsportsapp.dto;

import java.time.Instant;

public record SessionDTO(
        Long id,
        String deviceId,
        String userAgent,
        String ip,
        Instant createdAt,
        Instant lastUsedAt,
        Instant expiresAt
) {}
