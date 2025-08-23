package com.bmessi.pickupsportsapp.dto;

public record WsErrorDTO(
        String code,
        String message,
        long timestamp
) {}
