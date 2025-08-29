package com.bmessi.pickupsportsapp.dto.venue;

/**
 * Summary of sport information for venue responses.
 */
public record SportSummary(
        Long id,
        String name,
        String displayName
) {}
