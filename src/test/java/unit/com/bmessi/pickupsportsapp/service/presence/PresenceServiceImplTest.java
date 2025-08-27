package unit.com.bmessi.pickupsportsapp.service.presence;

import com.bmessi.pickupsportsapp.service.presence.PresenceServiceImpl;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PresenceServiceImplTest {

    @Mock
    StringRedisTemplate redis;
    @Mock
    ZSetOperations<String, String> zset;

    PresenceServiceImpl svc;

    @BeforeEach
    void setup() {
        when(redis.opsForZSet()).thenReturn(zset);
        svc = new PresenceServiceImpl(redis, new SimpleMeterRegistry());
    }

    @Test
    void heartbeat_prunesStaleEntries() {
        long before = Instant.now().getEpochSecond();
        svc.heartbeat(1L, "alice");
        ArgumentCaptor<Double> maxCaptor = ArgumentCaptor.forClass(Double.class);
        verify(zset).removeRangeByScore(eq("presence:game:1"), eq(0d), maxCaptor.capture());
        double max = maxCaptor.getValue();
        long after = Instant.now().getEpochSecond();
        assertTrue(max >= before - 30 - 2 && max <= after - 30);
    }

    @Test
    void onlineCount_returnsActiveCount() {
        when(zset.count(anyString(), anyDouble(), anyDouble())).thenReturn(2L);
        long before = Instant.now().getEpochSecond();
        long cnt = svc.onlineCount(5L);
        long after = Instant.now().getEpochSecond();
        assertEquals(2L, cnt);
        ArgumentCaptor<Double> minCaptor = ArgumentCaptor.forClass(Double.class);
        verify(zset).count(eq("presence:game:5"), minCaptor.capture(), eq(Double.POSITIVE_INFINITY));
        double min = minCaptor.getValue();
        assertTrue(min >= before - 30 - 1 && min <= after - 30 + 1);
    }
}

