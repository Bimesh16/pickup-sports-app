package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.MfaRecoveryCode;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.MfaRecoveryCodeRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MfaRecoveryServiceTest {

    @Mock MfaRecoveryCodeRepository repo;
    @Mock UserRepository users;
    @Mock MeterRegistry meter;

    @InjectMocks MfaRecoveryService svc;

    private User user;

    @BeforeEach
    void setup() {
        user = User.builder().id(100L).username("alice").build();
        when(users.findOptionalByUsername("alice")).thenReturn(Optional.of(user));
    }

    @Test
    void regenerate_createsRequestedCount_andReturnsPlainCodes() {
        List<String> codes = svc.regenerate("alice", 8);

        assertEquals(8, codes.size());
        verify(repo, times(1)).deleteByUser_Id(100L);
        verify(repo, times(8)).save(any(MfaRecoveryCode.class));
    }

    @Test
    void listMasked_returnsMaskedHashes() throws Exception {
        MfaRecoveryCode c1 = MfaRecoveryCode.builder().id(1L).user(user)
                .codeHash(sha256ViaReflection("code1")).build();
        MfaRecoveryCode c2 = MfaRecoveryCode.builder().id(2L).user(user)
                .codeHash(sha256ViaReflection("code2")).build();

        when(repo.findByUser_IdAndConsumedAtIsNull(100L)).thenReturn(List.of(c1, c2));

        List<String> masked = svc.listMasked("alice");
        assertEquals(2, masked.size());
        assertTrue(masked.get(0).startsWith("****"));
        assertTrue(masked.get(1).startsWith("****"));
    }

    @Test
    void consume_marksCodeAsUsed_andReturnsTrue() throws Exception {
        String code = "plain-recovery";
        String hash = sha256ViaReflection(code);
        MfaRecoveryCode row = MfaRecoveryCode.builder().id(10L).user(user).codeHash(hash).build();

        when(repo.findByCodeHashAndConsumedAtIsNull(hash)).thenReturn(Optional.of(row));
        when(repo.save(any(MfaRecoveryCode.class))).thenAnswer(inv -> inv.getArgument(0));

        boolean ok = svc.consume(code);

        assertTrue(ok);
        assertNotNull(row.getConsumedAt());
        verify(repo).save(row);
    }

    @Test
    void consume_nonExisting_returnsFalse() {
        when(repo.findByCodeHashAndConsumedAtIsNull(anyString())).thenReturn(Optional.empty());
        assertFalse(svc.consume("missing"));
        verify(repo, never()).save(any());
    }

    // Use reflection to call private static sha256 for consistent hashing
    private static String sha256ViaReflection(String value) throws Exception {
        Method m = MfaRecoveryService.class.getDeclaredMethod("sha256", String.class);
        m.setAccessible(true);
        return (String) m.invoke(null, value);
    }
}
