package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

/**
 * Entity representing user payment settings and preferences.
 * 
 * Features:
 * - Country and currency preferences
 * - Payment method preferences
 * - International payment support
 * - Exchange rate tracking
 * 
 * @author Pickup Sports App Team
 * @version 1.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "user_payment_settings", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPaymentSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_user_payment_settings_user"))
    private User user;

    @Column(name = "country", length = 50, nullable = false)
    private String country;

    @Column(name = "currency", length = 3, nullable = false)
    private String currency;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_payment_methods", joinColumns = @JoinColumn(name = "user_payment_settings_id"))
    @Column(name = "payment_method", length = 50)
    @Builder.Default
    private List<String> paymentMethods = List.of();

    @Column(name = "preferred_payment_method", length = 50)
    private String preferredPaymentMethod;

    @Column(name = "auto_currency_conversion")
    @Builder.Default
    private boolean autoCurrencyConversion = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
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

    public static UserPaymentSettings defaults(User user) {
        return UserPaymentSettings.builder()
                .user(user)
                .country("Nepal")
                .currency("NPR")
                .paymentMethods(List.of("card", "mobile_money"))
                .preferredPaymentMethod("card")
                .autoCurrencyConversion(true)
                .build();
    }
}
