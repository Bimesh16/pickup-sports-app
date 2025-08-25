package com.bmessi.pickupsportsapp.dto;

import java.util.Set;

public record PresenceSnapshotDTO(
        Long gameId,
        long count,
        Set<String> users
) {}
