package com.bmessi.pickupsportsapp.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class TypingEventDTO {
    private String sender;
    private boolean typing;   // true when typing, false when stopped
    private Instant at;       // server will fill if null
}
