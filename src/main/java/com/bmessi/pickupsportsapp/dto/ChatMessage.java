package com.bmessi.pickupsportsapp.dto;

/**
 * Represents a chat message sent from a user in a game chat room.
 */
public record ChatMessage(
        Long gameId,
        String sender,
        String content
) {}
