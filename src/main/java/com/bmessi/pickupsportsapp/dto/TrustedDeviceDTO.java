package com.bmessi.pickupsportsapp.dto;

import java.time.Instant;

public record TrustedDeviceDTO(
        String deviceId,
        Instant trustedUntil,
        Instant createdAt
) {}
