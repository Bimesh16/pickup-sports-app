package com.bmessi.pickupsportsapp.dto;

import java.io.Serializable;
import java.util.Locale;

/**
 * Simple DTO representing an email task to be processed asynchronously.
 */
public record EmailJob(
        String type,
        String to,
        String link,
        Locale locale
) implements Serializable {
}
