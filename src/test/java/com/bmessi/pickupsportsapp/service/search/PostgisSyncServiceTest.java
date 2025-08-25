package com.bmessi.pickupsportsapp.service.search;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PostgisSyncServiceTest {

    @Autowired JdbcTemplate jdbc;
    @Autowired PostgisSyncService service;

    @Test
    void backfillRunsOnPostgresOnly() throws Exception {
        String product = jdbc.getDataSource().getConnection().getMetaData().getDatabaseProductName();
        boolean isPg = product != null && product.toLowerCase().contains("postgres");
        Assumptions.assumeTrue(isPg, "Skip when not PostgreSQL");

        int updated = service.backfillOnce();
        assertTrue(updated >= 0);
    }
}
