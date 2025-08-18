package com.bmessi.pickupsportsapp.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String error,
        String message,
        String path,
        int status,
        long timestamp
) {
    public static ErrorResponse of(String error, String message, int status) {
        return new ErrorResponse(error, message, null, status, Instant.now().toEpochMilli());
    }

    public static ErrorResponse of(String error, String message, String path, int status) {
        return new ErrorResponse(error, message, path, status, Instant.now().toEpochMilli());
    }
}