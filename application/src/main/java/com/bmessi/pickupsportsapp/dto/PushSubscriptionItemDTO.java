package com.bmessi.pickupsportsapp.dto;

import java.time.Instant;

public record PushSubscriptionItemDTO(
        String endpoint,
        Instant createdAt
) {}
