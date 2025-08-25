package com.bmessi.pickupsportsapp.dto;

public record NotificationEvent(
        String type,     // "created", "read", "deleted"
        Long id,
        String message,
        boolean read,
        long createdAt
) {
    public static NotificationEvent created(com.bmessi.pickupsportsapp.entity.Notification n) {
        return new NotificationEvent("created", n.getId(), n.getMessage(), n.isRead(),
                n.getCreatedAt() != null ? n.getCreatedAt().toEpochMilli() : System.currentTimeMillis());
    }

    public static NotificationEvent read(com.bmessi.pickupsportsapp.entity.Notification n) {
        return new NotificationEvent("read", n.getId(), n.getMessage(), true,
                n.getCreatedAt() != null ? n.getCreatedAt().toEpochMilli() : System.currentTimeMillis());
    }

    public static NotificationEvent deleted(Long id) {
        return new NotificationEvent("deleted", id, null, true, System.currentTimeMillis());
    }
}
