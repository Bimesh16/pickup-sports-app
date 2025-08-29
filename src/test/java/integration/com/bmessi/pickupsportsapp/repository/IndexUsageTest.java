package integration.com.bmessi.pickupsportsapp.repository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assumptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@ActiveProfiles("test")
class IndexUsageTest {

    @Autowired
    private JdbcTemplate jdbc;

    private boolean isPostgres() {
        try {
            String product = jdbc.getDataSource().getConnection().getMetaData().getDatabaseProductName();
            return product != null && product.toLowerCase().contains("postgres");
        } catch (Exception e) {
            return false;
        }
    }

    @Test
    void gameQueriesUseIndexes() {
        Assumptions.assumeTrue(isPostgres(), "This index-name assertion runs only on PostgreSQL");

        jdbc.execute("CREATE INDEX idx_game_time ON game(time)");
        jdbc.execute("CREATE INDEX idx_game_location ON game(location)");

        String timePlan = jdbc.queryForObject("EXPLAIN SELECT * FROM game WHERE time >= NOW()", String.class);
        assertNotNull(timePlan);
        assertTrue(timePlan.toLowerCase().contains("idx_game_time"),
                () -> "Expected plan to contain idx_game_time, got: " + timePlan);

        String locationPlan = jdbc.queryForObject("EXPLAIN SELECT * FROM game WHERE location = 'NYC'", String.class);
        assertNotNull(locationPlan);
        assertTrue(locationPlan.toLowerCase().contains("idx_game_location"),
                () -> "Expected plan to contain idx_game_location, got: " + locationPlan);
    }

    @Test
    void userQueryUsesUsernameIndex() {
        Assumptions.assumeTrue(isPostgres(), "This index-name assertion runs only on PostgreSQL");

        jdbc.execute("CREATE INDEX idx_app_user_username ON app_user(username)");

        String plan = jdbc.queryForObject("EXPLAIN SELECT * FROM app_user WHERE username = 'alice'", String.class);
        assertNotNull(plan);
        assertTrue(plan.toLowerCase().contains("idx_app_user_username"),
                () -> "Expected plan to contain idx_app_user_username, got: " + plan);
    }
}
