package com.bmessi.pickupsportsapp.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class PostgisHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbc;

    public PostgisHealthIndicator(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Health health() {
        try {
            String product = jdbc.getDataSource().getConnection().getMetaData().getDatabaseProductName();
            boolean postgres = product != null && product.toLowerCase().contains("postgres");
            if (!postgres) {
                return Health.unknown().withDetail("db", product).withDetail("postgis", "n/a").build();
            }
            Integer cnt = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM pg_extension WHERE extname = 'postgis'",
                    Integer.class
            );
            boolean enabled = cnt != null && cnt > 0;
            return enabled ? Health.up().withDetail("postgis", true).build()
                           : Health.unknown().withDetail("postgis", false).build();
        } catch (Exception e) {
            return Health.down().withDetail("error", e.getMessage()).build();
        }
    }
}
