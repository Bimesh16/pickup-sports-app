package com.bmessi.pickupsportsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ReadStatusDTO {
    private Long messageId;
    private long count;
    private List<String> readers; // usernames/emails
}
