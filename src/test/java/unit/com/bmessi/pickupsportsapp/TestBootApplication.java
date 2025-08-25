package unit.com.bmessi.pickupsportsapp;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

/**
 * Minimal Spring Boot configuration for unit tests under the
 * "unit.com.bmessi.pickupsportsapp" package hierarchy.
 *
 * Provides a @SpringBootConfiguration so Boot test slices (e.g., @WebMvcTest)
 * can locate a configuration class when searching packages upwards.
 */
@SpringBootConfiguration
@EnableAutoConfiguration
public class TestBootApplication {
}
