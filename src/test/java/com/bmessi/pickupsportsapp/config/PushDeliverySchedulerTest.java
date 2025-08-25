package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.entity.PushOutbox;
import com.bmessi.pickupsportsapp.entity.PushSubscription;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.PushOutboxRepository;
import com.bmessi.pickupsportsapp.repository.PushSubscriptionRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureTestDatabase
class PushDeliverySchedulerTest {

    @Autowired PushDeliveryScheduler scheduler;
    @Autowired PushOutboxRepository outbox;
    @Autowired PushSubscriptionRepository subs;
    @Autowired UserRepository users;

    @Test
    @Transactional
    void flush_marksOutboxSent_whenSubscriptionExists() {
        User u = users.save(User.builder().username("alice@example.com").password("x").build());
        subs.save(PushSubscription.builder().user(u).endpoint("https://e").build());
        PushOutbox row = outbox.save(PushOutbox.builder()
                .user(u).title("t").body("b").status(PushOutbox.Status.PENDING).build());

        scheduler.flush();

        PushOutbox saved = outbox.findById(row.getId()).orElseThrow();
        assertEquals(PushOutbox.Status.SENT, saved.getStatus());
        assertNotNull(saved.getSentAt());
    }
}
