package integration.com.bmessi.pickupsportsapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        classes = PickupSportsAppApplicationTests.TestBootConfig.class
)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        // Only exclude problematic auto-configurations
        "spring.autoconfigure.exclude=" +
                "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration," +
                "org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration," +
                "org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
class PickupSportsAppApplicationTests {

    @Test
    void contextLoads() { }

    @SpringBootConfiguration
    @EnableAutoConfiguration
    static class TestBootConfig { }
}