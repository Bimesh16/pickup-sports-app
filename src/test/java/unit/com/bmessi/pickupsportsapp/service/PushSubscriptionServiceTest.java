package unit.com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.PushSubscription;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.PushSubscriptionRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.PushSubscriptionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PushSubscriptionServiceTest {

    @Mock PushSubscriptionRepository repo;
    @Mock UserRepository users;

    @Test
    void save_createsOrUpdatesSubscription() {
        PushSubscriptionService svc = new PushSubscriptionService(repo, users);
        when(users.findOptionalByUsername("alice")).thenReturn(Optional.of(User.builder().id(1L).username("alice").build()));
        when(repo.findByEndpoint("https://push")).thenReturn(Optional.empty());
        when(repo.save(any(PushSubscription.class))).thenAnswer(inv -> inv.getArgument(0));

        PushSubscription sub = svc.save("alice", "https://push", "k", "a");
        assertEquals("https://push", sub.getEndpoint());
        assertEquals("k", sub.getP256dh());
        assertEquals("a", sub.getAuth());
    }

    @Test
    void list_returnsSubscriptions() {
        PushSubscriptionService svc = new PushSubscriptionService(repo, users);
        when(repo.findByUser_Username("bob")).thenReturn(List.of(
                PushSubscription.builder().endpoint("e1").build(),
                PushSubscription.builder().endpoint("e2").build()
        ));

        var list = svc.list("bob");
        assertEquals(2, list.size());
    }

    @Test
    void delete_deletesByEndpoint() {
        PushSubscriptionService svc = new PushSubscriptionService(repo, users);
        svc.delete("bob", "e1");
        verify(repo).deleteByUser_UsernameAndEndpoint("bob", "e1");
    }
}
