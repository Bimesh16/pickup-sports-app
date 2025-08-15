package com.bmessi.pickupsportsapp.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record GameDetailsDTO(
        Long id,
        String sport,
        String location,
        OffsetDateTime time,
        List<UserDTO> participants
) {}