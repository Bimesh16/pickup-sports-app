package com.bmessi.pickupsportsapp.dto;

import java.time.Instant;

public record ChatReadCursorResponse(
        Instant lastReadAt,
        Long lastReadMessageId
) {}
