package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entity representing a venue booking for a game.
 */
@Entity
@Table(name = "venue_bookings", indexes = {
        @Index(name = "idx_venue_booking_venue", columnList = "venue_id"),
        @Index(name = "idx_venue_booking_game", columnList = "game_id"),
        @Index(name = "idx_venue_booking_time", columnList = "start_time, end_time"),
        @Index(name = "idx_venue_booking_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private com.bmessi.pickupsportsapp.entity.game.Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booked_by", nullable = false)
    private User bookedBy;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private OffsetDateTime endTime;

    @Column(name = "total_cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @Column(name = "cost_per_player", precision = 10, scale = 2)
    private BigDecimal costPerPlayer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private Long cancelledBy;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CANCELLED,
        COMPLETED,
        NO_SHOW
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        PARTIALLY_REFUNDED,
        FULLY_REFUNDED,
        FAILED
    }
}
