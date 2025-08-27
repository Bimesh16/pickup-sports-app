package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "host_action_audit", indexes = {
        @Index(name = "idx_host_action_audit_action", columnList = "action"),
        @Index(name = "idx_host_action_audit_created_at", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostActionAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false, length = 64)
    private String actor;

    @Column(nullable = false, updatable = false, length = 64)
    private String action;

    @Column(nullable = false, updatable = false, length = 64)
    private String targetType;

    @Column(updatable = false)
    private Long targetId;

    @Column(length = 1024, updatable = false)
    private String details;

    @Column(length = 64, updatable = false)
    private String correlationId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
