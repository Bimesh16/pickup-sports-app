package integration.com.bmessi.pickupsportsapp.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@ActiveProfiles("test")
class IndexUsageTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void gameQueriesUseIndexes() {
        jdbc.execute("CREATE INDEX idx_game_time ON game(time)");
        jdbc.execute("CREATE INDEX idx_game_location ON game(location)");

        String timePlan = jdbc.queryForObject("EXPLAIN SELECT * FROM game WHERE time >= NOW()", String.class);
        assertTrue(timePlan.contains("IDX_GAME_TIME"));

        String locationPlan = jdbc.queryForObject("EXPLAIN SELECT * FROM game WHERE location = 'NYC'", String.class);
        assertTrue(locationPlan.contains("IDX_GAME_LOCATION"));
    }

    @Test
    void userQueryUsesUsernameIndex() {
        jdbc.execute("CREATE INDEX idx_app_user_username ON app_user(username)");

        String plan = jdbc.queryForObject("EXPLAIN SELECT * FROM app_user WHERE username = 'alice'", String.class);
        assertTrue(plan.contains("IDX_APP_USER_USERNAME"));
    }
}
