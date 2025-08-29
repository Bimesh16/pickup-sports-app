package unit.com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.HostActionAudit;
import com.bmessi.pickupsportsapp.repository.HostActionAuditRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import support.Quarantined;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@EntityScan(basePackages = "com.bmessi.pickupsportsapp.entity")
@EnableJpaRepositories(basePackages = "com.bmessi.pickupsportsapp.repository")
@Quarantined
class HostActionAuditRepositoryTest {

    @Autowired
    HostActionAuditRepository repo;

    @Test
    void entriesAreImmutable() {
        HostActionAudit a = HostActionAudit.builder()
                .actor("alice")
                .action("test")
                .targetType("game")
                .targetId(1L)
                .details("orig")
                .build();
        HostActionAudit saved = repo.save(a);

        // attempt to tamper
        saved.setDetails("hacked");
        repo.save(saved);

        HostActionAudit loaded = repo.findById(saved.getId()).orElseThrow();
        assertThat(loaded.getDetails()).isEqualTo("orig");
    }

    @Test
    void repositoryHasNoDeleteMethod() {
        boolean hasDelete = java.util.Arrays.stream(repo.getClass().getMethods())
                .anyMatch(m -> m.getName().startsWith("delete"));
        assertThat(hasDelete).isFalse();
    }
}
