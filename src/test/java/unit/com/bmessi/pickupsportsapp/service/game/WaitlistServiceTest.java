package com.bmessi.pickupsportsapp.service.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessResourceFailureException;
import com.bmessi.pickupsportsapp.service.notification.WaitlistPromotionEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.bmessi.pickupsportsapp.exception.WaitlistServiceException;

import java.util.List;
import java.util.Map;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WaitlistServiceTest {

    @Mock JdbcTemplate jdbc;
    @Mock ApplicationEventPublisher events;
    @InjectMocks WaitlistService svc;

    @BeforeEach
    void stubGame() {
        when(jdbc.queryForMap(startsWith("SELECT COALESCE"), any())).thenReturn(Map.of("sport", "", "location", ""));
    }

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
    void waitlistCount_returnsZeroWhenNull() {
        when(jdbc.queryForObject(contains("game_waitlist"), eq(Integer.class), any())).thenReturn(null);
        assertEquals(0, svc.waitlistCount(1L));
    }

    @Test
    void waitlistCount_returnsValue() {
        when(jdbc.queryForObject(contains("game_waitlist"), eq(Integer.class), any())).thenReturn(3);
        assertEquals(3, svc.waitlistCount(3L));
    }

    @Test
    void addToWaitlist_success() {
        when(jdbc.update(startsWith("INSERT INTO game_waitlist"), any(), any(), any())).thenReturn(1);
        assertTrue(svc.addToWaitlist(4L, 7L));
        verify(jdbc).update(startsWith("INSERT INTO game_waitlist"), eq(4L), eq(7L), any());
    }

    @Test
    void addToWaitlist_failure() {
        when(jdbc.update(startsWith("INSERT INTO game_waitlist"), any(), any(), any())).thenReturn(0);
        assertFalse(svc.addToWaitlist(4L, 7L));
    }

    @Test
    void removeFromWaitlist_success() {
        when(jdbc.update(startsWith("DELETE FROM game_waitlist"), any(), any())).thenReturn(1);
        assertTrue(svc.removeFromWaitlist(4L, 7L));
        verify(jdbc).update(startsWith("DELETE FROM game_waitlist"), eq(4L), eq(7L));
    }

    @Test
    void removeFromWaitlist_failure() {
        when(jdbc.update(startsWith("DELETE FROM game_waitlist"), any(), any())).thenReturn(0);
        assertFalse(svc.removeFromWaitlist(4L, 7L));
    }

    @Test
    void addToWaitlist_throwsCustomExceptionOnDataAccessError() {
        when(jdbc.update(startsWith("INSERT INTO game_waitlist"), any(), any(), any()))
                .thenThrow(new DataAccessResourceFailureException("db down"));

        WaitlistServiceException exception = assertThrows(WaitlistServiceException.class,
                () -> svc.addToWaitlist(1L, 2L));

        assertEquals("Unable to add to waitlist", exception.getMessage());
        assertInstanceOf(DataAccessResourceFailureException.class, exception.getCause());
    }

    @Test
    void promoteUpTo_returnsIdsAndPublishesEvents() {
        when(jdbc.queryForList(startsWith("WITH selected"), (Object[]) any(), (Class<Object>) any()))
                .thenReturn(List.of(
                        Map.of("user_id", 10L, "username", "u1"),
                        Map.of("user_id", 11L, "username", "u2")
                ));

        List<Long> ids = svc.promoteUpTo(5L, 2);

        assertEquals(List.of(10L, 11L), ids);
        verify(jdbc).queryForList(startsWith("WITH selected"), eq(5L), eq(2));
        verify(events).publishEvent(new WaitlistPromotionEvent("u1", "", ""));
        verify(events).publishEvent(new WaitlistPromotionEvent("u2", "", ""));
    }

    @Test
    void promoteUpTo_emptyWaitlist() {
        when(jdbc.queryForList(startsWith("WITH selected"), (Object[]) any(), (Class<Object>) any()))
                .thenReturn(Collections.emptyList());

        List<Long> ids = svc.promoteUpTo(5L, 2);

        assertTrue(ids.isEmpty());
        verify(events, never()).publishEvent(any());
    }

    @Test
    void promoteUpTo_zeroSlots() {
        List<Long> ids = svc.promoteUpTo(5L, 0);

        assertTrue(ids.isEmpty());
        verify(jdbc).queryForList(startsWith("WITH selected"), eq(5L), eq(0));
        verify(events, never()).publishEvent(any());
    }

    @Test
    void promoteUpTo_negativeSlots() {
        List<Long> ids = svc.promoteUpTo(5L, -1);

        assertTrue(ids.isEmpty());
        verify(jdbc).queryForList(startsWith("WITH selected"), eq(5L), eq(0));
        verify(events, never()).publishEvent(any());
    }

    @Test
    void promoteUpTo_publishEvent() {
        when(jdbc.queryForList(startsWith("WITH selected"), (Object[]) any(), (Class<Object>) any()))
                .thenReturn(List.of(Map.of("user_id", 10L, "username", "u1")));

        // Should publish event even if listener fails (publisher mocked not throwing)
        List<Long> ids = svc.promoteUpTo(5L, 1);

        assertEquals(List.of(10L), ids);
        verify(events).publishEvent(new WaitlistPromotionEvent("u1", "", ""));
    }
}