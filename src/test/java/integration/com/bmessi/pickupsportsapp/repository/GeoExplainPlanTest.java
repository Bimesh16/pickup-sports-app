package integration.com.bmessi.pickupsportsapp.repository;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.DatabaseMetaData;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class GeoExplainPlanTest {

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void explainNearbyPlan_ifPostgres() throws Exception {
        DatabaseMetaData md = jdbc.getDataSource().getConnection().getMetaData();
        String product = md.getDatabaseProductName();
        boolean isPg = product != null && product.toLowerCase().contains("postgres");
        Assumptions.assumeTrue(isPg, "This test runs only on PostgreSQL");

        // Minimal EXPLAIN to ensure the DB can plan the bounding-box query
        String sql = """
                EXPLAIN
                SELECT id, time, latitude, longitude
                  FROM game
                 WHERE latitude IS NOT NULL AND longitude IS NOT NULL
                   AND latitude BETWEEN 0 AND 0
                   AND longitude BETWEEN 0 AND 0
                 ORDER BY time
                 LIMIT 1
                """;
        String plan = jdbc.queryForObject(sql, String.class);
        assertNotNull(plan);
    }
}
