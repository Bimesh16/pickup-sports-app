package com.bmessi.pickupsportsapp.service.game;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessResourceFailureException;
import com.bmessi.pickupsportsapp.service.push.PushSenderService;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WaitlistServiceTest {

    @Mock JdbcTemplate jdbc;
    @Mock PushSenderService push;
    @InjectMocks WaitlistService svc;

    @Test
    void participantCount_returnsZeroWhenNull() {
        when(jdbc.queryForObject(anyString(), eq(Integer.class), any())).thenReturn(null);
        int n = svc.participantCount(1L);
        assertEquals(0, n);
    }

    @Test
    void participantCount_returnsValue() {
        when(jdbc.queryForObject(anyString(), eq(Integer.class), any())).thenReturn(5);
        assertEquals(5, svc.participantCount(2L));
    }

    @Test
    void waitlistCount_returnsValue() {
        when(jdbc.queryForObject(contains("game_waitlist"), eq(Integer.class), any())).thenReturn(3);
        assertEquals(3, svc.waitlistCount(3L));
    }

    @Test
    void addAndRemove_waitlist() {
        when(jdbc.update(startsWith("INSERT INTO game_waitlist"), any(), any(), any())).thenReturn(1);
        assertTrue(svc.addToWaitlist(4L, 7L));
        when(jdbc.update(startsWith("DELETE FROM game_waitlist"), any(), any())).thenReturn(1);
        assertTrue(svc.removeFromWaitlist(4L, 7L));
    }

    @Test
    void addToWaitlist_throwsCustomExceptionOnDataAccessError() {
        when(jdbc.update(startsWith("INSERT INTO game_waitlist"), any(), any(), any()))
                .thenThrow(new DataAccessResourceFailureException("db down"));
        assertThrows(com.bmessi.pickupsportsapp.exception.WaitlistServiceException.class,
                () -> svc.addToWaitlist(1L, 2L));
    }

    @Test
    void promoteUpTo_returnsIdsAndEnqueuesPush() {
        when(jdbc.queryForList(startsWith("WITH selected"), any(), any()))
                .thenReturn(List.of(
                        Map.of("user_id", 10L, "username", "u1"),
                        Map.of("user_id", 11L, "username", "u2")
                ));
        List<Long> ids = svc.promoteUpTo(5L, 2);
        assertEquals(2, ids.size());
        verify(push).enqueue(eq("u1"), any(), any(), any());
        verify(push).enqueue(eq("u2"), any(), any(), any());
    }
}
