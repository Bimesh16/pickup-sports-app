package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_notification_prefs", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNotificationPrefs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_user_notification_prefs_user"))
    private User user;

    @Column(nullable = false)
    private boolean inAppOnRsvp;

    @Column(nullable = false)
    private boolean inAppOnCreate;

    @Column(nullable = false)
    private boolean inAppOnCancel;

    @Column(nullable = false)
    private boolean emailOnRsvp;

    @Column(nullable = false)
    private boolean emailOnCreate;

    @Column(nullable = false)
    private boolean emailOnCancel;

    // Push channel preferences
    @Column(nullable = false)
    @Builder.Default
    private boolean pushOnRsvp = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushOnCreate = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushOnCancel = true;

    // Additional notification categories
    @Column(nullable = false)
    @Builder.Default
    private boolean gameInvites = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean gameUpdates = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean achievements = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean socialActivity = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean marketing = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushNotifications = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailNotifications = true;

    // Digest preferences
    @Column(nullable = false)
    @Builder.Default
    private boolean emailDigestDaily = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailDigestWeekly = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public static UserNotificationPrefs defaults(User u) {
        return UserNotificationPrefs.builder()
                .user(u)
                .inAppOnRsvp(true)
                .inAppOnCreate(true)
                .inAppOnCancel(true)
                .emailOnRsvp(true)
                .emailOnCreate(true)
                .emailOnCancel(true)
                .pushOnRsvp(true)
                .pushOnCreate(true)
                .pushOnCancel(true)
                .gameInvites(true)
                .gameUpdates(true)
                .achievements(true)
                .socialActivity(true)
                .marketing(false)
                .pushNotifications(true)
                .emailNotifications(true)
                .build();
    }
}
