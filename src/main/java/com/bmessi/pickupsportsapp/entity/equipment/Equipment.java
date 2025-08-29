package com.bmessi.pickupsportsapp.entity.equipment;

import com.bmessi.pickupsportsapp.entity.Venue;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Equipment entity for managing sports equipment and gear.
 */
@Entity
@Table(name = "equipment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private EquipmentCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private EquipmentType type;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "size", length = 50)
    private String size; // e.g., "M", "L", "XL", "10", "42"

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "condition_rating", precision = 3, scale = 2)
    private BigDecimal conditionRating; // 1.00 to 5.00 scale

    @Column(name = "purchase_date")
    private OffsetDateTime purchaseDate;

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "current_value", precision = 10, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "rental_price_per_day", precision = 10, scale = 2)
    private BigDecimal rentalPricePerDay;

    @Column(name = "rental_price_per_hour", precision = 10, scale = 2)
    private BigDecimal rentalPricePerHour;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    @Column(name = "is_rentable", nullable = false)
    private Boolean isRentable;

    @Column(name = "is_for_sale", nullable = false)
    private Boolean isForSale;

    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "minimum_quantity", nullable = false)
    private Integer minimumQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(name = "storage_location", length = 100)
    private String storageLocation;

    @Column(name = "maintenance_notes", length = 1000)
    private String maintenanceNotes;

    @Column(name = "last_maintenance_date")
    private OffsetDateTime lastMaintenanceDate;

    @Column(name = "next_maintenance_date")
    private OffsetDateTime nextMaintenanceDate;

    @Column(name = "warranty_expiry_date")
    private OffsetDateTime warrantyExpiryDate;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "qr_code", length = 100)
    private String qrCode;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "specifications", length = 2000)
    private String specifications; // JSON string of technical specs

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum EquipmentCategory {
        BALLS, NETS, GOALS, PADS, PROTECTIVE_GEAR, TRAINING_EQUIPMENT, SCORING_EQUIPMENT, 
        TIMING_EQUIPMENT, MEASUREMENT_EQUIPMENT, ACCESSORIES, OTHER
    }

    public enum EquipmentType {
        SOCCER_BALL, BASKETBALL, TENNIS_RACKET, VOLLEYBALL_NET, SOCCER_GOAL, 
        BASKETBALL_HOOP, TENNIS_NET, PADDING, HELMET, SHIN_GUARDS, 
        TRAINING_CONES, SCOREBOARD, STOPWATCH, MEASURING_TAPE, WATER_COOLER, OTHER
    }
}
