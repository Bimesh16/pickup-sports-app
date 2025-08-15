package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;

public record GameSummaryDTO(
        Long id,
        String sport,
        String location,
        OffsetDateTime time
) {}