package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.TrustedDevice;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.TrustedDeviceRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrustedDeviceServiceTest {

    @Mock TrustedDeviceRepository repo;
    @Mock UserRepository users;

    @InjectMocks TrustedDeviceService svc;

    private User user;

    @BeforeEach
    void setup() {
        user = User.builder().id(200L).username("bob").build();
        when(users.findOptionalByUsername("bob")).thenReturn(Optional.of(user));
    }

    @Test
    void isTrusted_trueWhenActive() {
        TrustedDevice td = TrustedDevice.builder()
                .user(user)
                .deviceId("dev-1")
                .trustedUntil(Instant.now().plus(10, ChronoUnit.DAYS))
                .build();
        when(repo.findByUser_IdAndDeviceId(200L, "dev-1")).thenReturn(Optional.of(td));

        assertTrue(svc.isTrusted("bob", "dev-1"));
    }

    @Test
    void trust_createsOrUpdatesTrustedDevice() {
        when(repo.findByUser_IdAndDeviceId(200L, "dev-1")).thenReturn(Optional.empty());
        when(repo.save(any(TrustedDevice.class))).thenAnswer(inv -> inv.getArgument(0));

        svc.trust("bob", "dev-1");

        verify(repo).save(any(TrustedDevice.class));
    }

    @Test
    void list_returnsAllForUser() {
        when(repo.findByUser_Id(200L)).thenReturn(List.of(
                TrustedDevice.builder().user(user).deviceId("a").build(),
                TrustedDevice.builder().user(user).deviceId("b").build()
        ));

        List<TrustedDevice> out = svc.list("bob");
        assertEquals(2, out.size());
    }

    @Test
    void revoke_deletesByUserAndDevice() {
        svc.revoke("bob", "dev-2");
        verify(repo).deleteByUser_IdAndDeviceId(200L, "dev-2");
    }
}
