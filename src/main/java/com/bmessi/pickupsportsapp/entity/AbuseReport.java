package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "abuse_report", indexes = {
        @Index(name = "idx_abuse_report_status", columnList = "status"),
        @Index(name = "idx_abuse_report_created_at", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbuseReport {

    public enum SubjectType { GAME, MESSAGE, USER }
    public enum Status { OPEN, IN_REVIEW, RESOLVED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false, foreignKey = @ForeignKey(name = "fk_abuse_report_user"))
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SubjectType subjectType;

    @Column(nullable = false)
    private Long subjectId;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant resolvedAt;

    @Column(length = 255)
    private String resolver; // username of admin who resolved

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = Status.OPEN;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
