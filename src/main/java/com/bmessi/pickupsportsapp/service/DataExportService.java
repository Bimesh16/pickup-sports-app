package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class DataExportService {

    private final UserRepository users;
    private final NotificationRepository notifications;
    private final PushSubscriptionRepository pushSubs;
    private final TrustedDeviceRepository trustedDevices;
    private final UserNotificationPrefsRepository prefsRepo;
    private final JdbcTemplate jdbc;
    private final Map<String, String> pending = new ConcurrentHashMap<>();

    public String requestExport(String username) {
        String token = UUID.randomUUID().toString();
        pending.put(token, username);
        return token;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> confirmExport(String username, String token) {
        String stored = pending.remove(token);
        if (stored == null || !stored.equals(username)) {
            throw new IllegalArgumentException("invalid token");
        }
        return exportFor(username);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportFor(String username) {
        User u = users.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        long notifTotal = notifications.countByUser_Id(u.getId());
        long notifUnread = notifications.countByUser_IdAndReadFalse(u.getId());

        Integer gamesCreated = jdbc.queryForObject(
                "SELECT COUNT(*) FROM game WHERE user_id = ?", Integer.class, u.getId());
        if (gamesCreated == null) gamesCreated = 0;

        var prefs = prefsRepo.findByUser_Id(u.getId()).orElse(null);

        var subs = pushSubs.findByUser_Username(username).stream()
                .map(s -> Map.of(
                        "endpoint", s.getEndpoint(),
                        "createdAt", s.getCreatedAt()
                )).toList();

        var devices = trustedDevices.findByUser_Id(u.getId()).stream()
                .map(d -> Map.of(
                        "deviceId", d.getDeviceId(),
                        "trustedUntil", d.getTrustedUntil(),
                        "createdAt", d.getCreatedAt()
                )).toList();

        return Map.of(
                "user", Map.of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "preferredSport", safe(u.getPreferredSport()),
                        "location", safe(u.getLocation()),
                        "bio", safe(u.getBio()),
                        "avatarUrl", safe(u.getAvatarUrl()),
                        "skillLevel", u.getSkillLevel() == null ? null : u.getSkillLevel().name(),
                        "age", u.getAge(),
                        "position", safe(u.getPosition()),
                        "contactPreference", safe(u.getContactPreference())
                ),
                "notifications", Map.of(
                        "total", notifTotal,
                        "unread", notifUnread
                ),
                "games", Map.of(
                        "createdCount", gamesCreated
                ),
                "preferences", prefs == null ? Map.of() : Map.of(
                        "inAppOnRsvp", prefs.isInAppOnRsvp(),
                        "inAppOnCreate", prefs.isInAppOnCreate(),
                        "inAppOnCancel", prefs.isInAppOnCancel(),
                        "emailOnRsvp", prefs.isEmailOnRsvp(),
                        "emailOnCreate", prefs.isEmailOnCreate(),
                        "emailOnCancel", prefs.isEmailOnCancel(),
                        "emailDigestDaily", prefs.isEmailDigestDaily(),
                        "emailDigestWeekly", prefs.isEmailDigestWeekly()
                ),
                "pushSubscriptions", subs,
                "trustedDevices", devices
        );
    }

    private static String safe(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
