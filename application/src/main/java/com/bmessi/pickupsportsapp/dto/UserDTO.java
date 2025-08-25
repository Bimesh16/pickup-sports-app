package com.bmessi.pickupsportsapp.dto;

public record UserDTO(
        Long id,
        String username,
        String preferredSport,
        String location
) {}