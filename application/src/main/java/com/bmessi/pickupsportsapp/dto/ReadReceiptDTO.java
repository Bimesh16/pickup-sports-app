package com.bmessi.pickupsportsapp.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class ReadReceiptDTO {
    private Long messageId;
    private String reader;     // if null, we’ll fill from Principal
    private Instant readAt;    // optional; server will set if null
}
