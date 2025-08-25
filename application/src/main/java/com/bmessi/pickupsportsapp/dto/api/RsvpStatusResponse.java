package com.bmessi.pickupsportsapp.dto.api;

public record RsvpStatusResponse(
        boolean joined,
        boolean waitlisted,
        Integer capacity,
        int openSlots,
        boolean cutoff
) {}
