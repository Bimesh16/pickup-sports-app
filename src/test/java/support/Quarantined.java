package support;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Tag;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/**
 * Marks a test or test class as quarantined: temporarily disabled,
 * tracked, and easy to re-enable once fixed.
 *
 * Usage:
 *   @Quarantined
 *   @Test
 *   void flaky_or_broken_test() { ... }
 *
 * You can still run only quarantined tests locally:
 *   mvn -Dtest=*Test -Dgroups=quarantined test
 * or with JUnit Platform tags:
 *   mvn -Dtest=*Test -Djunit.jupiter.tags=quarantined test
 */
@Target({TYPE, METHOD})
@Retention(RUNTIME)
@Documented
@Disabled("Quarantined: temporarily disabled pending fix. See tracking issue.")
@Tag("quarantined")
public @interface Quarantined {
}
