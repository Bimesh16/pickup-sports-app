package unit.com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.entity.PushOutbox;
import com.bmessi.pickupsportsapp.repository.PushOutboxRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PushNotificationTest {

    @Test
    void testPushOutboxEntity() {
        // Test PushOutbox entity creation
        PushOutbox pushOutbox = PushOutbox.builder()
                .title("Test Notification")
                .body("Test notification body")
                .status(PushOutbox.Status.PENDING)
                .build();

        assertNotNull(pushOutbox);
        assertEquals("Test Notification", pushOutbox.getTitle());
        assertEquals("Test notification body", pushOutbox.getBody());
        assertEquals(PushOutbox.Status.PENDING, pushOutbox.getStatus());
    }

    @Test
    void testPushOutboxStatusEnum() {
        // Test enum values
        assertEquals(3, PushOutbox.Status.values().length);
        assertTrue(java.util.Arrays.asList(PushOutbox.Status.values())
                .contains(PushOutbox.Status.PENDING));
        assertTrue(java.util.Arrays.asList(PushOutbox.Status.values())
                .contains(PushOutbox.Status.SENT));
        assertTrue(java.util.Arrays.asList(PushOutbox.Status.values())
                .contains(PushOutbox.Status.FAILED));
    }
}