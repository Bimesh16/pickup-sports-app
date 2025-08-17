package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;
import java.util.Set;

public record GameDetailsDTO(
        Long id,
        String sport,
        String location,
        OffsetDateTime time,
        String skillLevel,
        UserDTO creator,
        Set<UserDTO> participants
) {}