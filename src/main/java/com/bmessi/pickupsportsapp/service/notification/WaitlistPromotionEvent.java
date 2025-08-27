package com.bmessi.pickupsportsapp.service.notification;

/**
 * Event published when a user is promoted from a game waitlist.
 * Carries enough context for notification channels.
 */
public record WaitlistPromotionEvent(
        String username,
        String sport,
        String location
) {}
