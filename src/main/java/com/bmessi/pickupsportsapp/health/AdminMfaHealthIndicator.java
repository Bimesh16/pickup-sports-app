package com.bmessi.pickupsportsapp.health;

import com.bmessi.pickupsportsapp.config.properties.LoginPolicyProperties;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class AdminMfaHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbc;
    private final LoginPolicyProperties policy;

    public AdminMfaHealthIndicator(JdbcTemplate jdbc, LoginPolicyProperties policy) {
        this.jdbc = jdbc;
        this.policy = policy;
    }

    @Override
    public Health health() {
        if (!policy.isRequireMfaForAdmin()) {
            return Health.status("WARN").withDetail("requireMfaForAdmin", false)
                    .withDetail("message", "Admin MFA is disabled by policy").build();
        }
        try {
            Instant cutoff = Instant.now().minus(policy.getAdminMfaAlertWindowMinutes(), ChronoUnit.MINUTES);
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM admin_audit WHERE action = 'admin_login_without_mfa' AND created_at >= ?",
                    Integer.class,
                    java.sql.Timestamp.from(cutoff)
            );
            int c = count == null ? 0 : count;
            if (c > 0) {
                return Health.status("WARN").withDetail("recentAdminLoginsWithoutMfa", c).build();
            }
            return Health.up().withDetail("recentAdminLoginsWithoutMfa", 0).build();
        } catch (Exception e) {
            return Health.unknown().withDetail("error", e.getMessage()).build();
        }
    }
}
