package com.bmessi.pickupsportsapp.dto.notification;

import java.time.Instant;

public record NotificationDTO(
        Long id,
        String message,
        Instant createdAt,
        boolean read,
        Instant readAt
) {}