package com.bmessi.pickupsportsapp.dto;

import java.io.Serializable;
import java.util.Locale;
import java.util.Map;

/**
 * Simple DTO representing a notification task to be processed asynchronously.
 */
public record NotificationJob(
        String recipient,
        String actor,
        String sport,
        String location,
        String action,
        Map<String, String> model,
        Locale locale
) implements Serializable {
}

