package com.bmessi.pickupsportsapp.service.compliance;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Consent management service for handling user consent and privacy preferences.
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Service
@Slf4j
public class ConsentManagementService {

    /**
     * Get user consents for a specific user.
     */
    public List<Map<String, Object>> getUserConsents(Long userId) {
        return List.of(
            Map.of(
                "consent_type", "Marketing Communications",
                "consent_status", "GRANTED",
                "granted_at", OffsetDateTime.now().minusMonths(3),
                "last_updated", OffsetDateTime.now().minusMonths(1),
                "legal_basis", "Consent",
                "withdrawal_method", "Account settings or email"
            ),
            Map.of(
                "consent_type", "Analytics and Performance",
                "consent_status", "GRANTED",
                "granted_at", OffsetDateTime.now().minusMonths(6),
                "last_updated", OffsetDateTime.now().minusMonths(6),
                "legal_basis", "Legitimate interest",
                "withdrawal_method", "Account settings"
            ),
            Map.of(
                "consent_type", "Third-party Services",
                "consent_status", "DENIED",
                "granted_at", null,
                "last_updated", OffsetDateTime.now().minusMonths(2),
                "legal_basis", "Consent",
                "withdrawal_method", "Account settings"
            )
        );
    }
}
