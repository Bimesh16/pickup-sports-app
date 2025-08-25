package com.bmessi.pickupsportsapp.i18n;

import java.util.Locale;
import java.util.ResourceBundle;

public final class EventI18n {
    private EventI18n() {}

    public static String subject(String action, Locale locale) {
        Locale loc = (locale == null ? Locale.ENGLISH : locale);
        try {
            ResourceBundle rb = ResourceBundle.getBundle("i18n/notifications", loc);
            String key = "subject." + norm(action);
            if (rb.containsKey(key)) {
                return rb.getString(key);
            }
        } catch (Exception ignore) {}
        // fallback
        return switch (norm(action)) {
            case "created", "create" -> "New game created";
            case "cancelled", "canceled", "cancel" -> "Game canceled";
            case "joined", "rsvp" -> "Game update";
            case "promoted" -> "You’ve been promoted from the waitlist";
            case "reminder" -> "Game reminder";
            default -> "Game notification";
        };
    }

    private static String norm(String s) {
        return s == null ? "" : s.trim().toLowerCase(Locale.ROOT);
    }
}
