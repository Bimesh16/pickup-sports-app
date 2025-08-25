package com.bmessi.pickupsportsapp.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SchemaFixConfig {

    private static final Logger log = LoggerFactory.getLogger(SchemaFixConfig.class);

    @Bean
    CommandLineRunner backfillCreatedAtAndEnforceNotNull(JdbcTemplate jdbcTemplate) {
        return args -> {
            // 1) Backfill existing NULLs
            try {
                int updated = jdbcTemplate.update("update game set created_at = now() where created_at is null");
                if (updated > 0) {
                    log.info("Backfilled created_at for {} row(s) in game table.", updated);
                }
            } catch (Exception e) {
                // Column may not exist yet on first startup; just log
                log.debug("Could not backfill game.created_at: {}", e.getMessage());
            }

            // 2) Enforce NOT NULL after backfill
            try {
                jdbcTemplate.execute("alter table if exists game alter column created_at set not null");
                log.info("Enforced NOT NULL on game.created_at");
            } catch (Exception e) {
                log.debug("Could not enforce NOT NULL on game.created_at: {}", e.getMessage());
            }
        };
    }
}