package com.bmessi.pickupsportsapp.entity.tenant;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Entity for tenant-specific configuration settings.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "tenant_configurations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @NotBlank(message = "Configuration key is required")
    @Size(max = 100, message = "Configuration key must not exceed 100 characters")
    @Column(name = "config_key", nullable = false, length = 100)
    private String configKey;

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_encrypted")
    @Builder.Default
    private boolean isEncrypted = false;

    @Column(name = "is_system_config")
    @Builder.Default
    private boolean isSystemConfig = false;

    @Column(name = "is_required")
    @Builder.Default
    private boolean isRequired = false;

    @Column(name = "validation_regex")
    private String validationRegex;

    @Column(name = "default_value")
    private String defaultValue;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
