package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.config.properties.LoginPolicyProperties;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class LoginAttemptService {

    private final LoginPolicyProperties props;
    private final MeterRegistry metrics;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.data.redis.core.StringRedisTemplate redis;

    private static final class UserState {
        final AtomicInteger failures = new AtomicInteger(0);
        volatile long lockoutUntilEpochMs = 0;
    }

    private static final class IpWindow {
        volatile long startEpochMs = System.currentTimeMillis();
        final AtomicInteger failures = new AtomicInteger(0);
    }

    private final Map<String, UserState> users = new ConcurrentHashMap<>();
    private final Map<String, IpWindow> ips = new ConcurrentHashMap<>();

    public LoginAttemptService(LoginPolicyProperties props, MeterRegistry metrics) {
        this.props = props;
        this.metrics = metrics;
    }

    public boolean isUserLocked(String username) {
        if (username == null || username.isBlank()) return false;
        if (redis != null && props.getLockoutMinutes() > 0 && props.getMaxFailuresPerUser() > 0
                && isDistributed()) {
            String lockKey = "lock:user:" + username.toLowerCase();
            Boolean exists = redis.hasKey(lockKey);
            return Boolean.TRUE.equals(exists);
        }
        UserState st = users.get(username.toLowerCase());
        long now = System.currentTimeMillis();
        return st != null && st.lockoutUntilEpochMs > now;
    }

    public boolean isIpBlocked(String ip) {
        if (ip == null || ip.isBlank()) return false;
        IpWindow w = ips.get(ip);
        if (w == null) return false;
        long now = System.currentTimeMillis();
        long windowMs = Duration.ofMinutes(props.getIpWindowMinutes()).toMillis();
        if (now - w.startEpochMs >= windowMs) return false;
        return w.failures.get() > props.getMaxFailuresPerIp();
    }

    public void onFailure(String username, String ip) {
        long now = System.currentTimeMillis();

        // per-user failures and lockout
        if (username != null && !username.isBlank()) {
            String key = username.toLowerCase();

            if (redis != null && isDistributed()) {
                String failKey = "fail:user:" + key;
                Long count = redis.opsForValue().increment(failKey);
                if (count != null && count == 1L) {
                    // expire fail counter slightly beyond lockout window to ensure cleanup
                    redis.expire(failKey, Duration.ofMinutes(props.getLockoutMinutes() + 1));
                }
                if (count != null && count >= props.getMaxFailuresPerUser()) {
                    String lockKey = "lock:user:" + key;
                    redis.opsForValue().set(lockKey, "1", Duration.ofMinutes(props.getLockoutMinutes()));
                    metrics.counter("security.login.locked").increment();
                }
            } else {
                UserState st = users.computeIfAbsent(key, k -> new UserState());
                int fail = st.failures.incrementAndGet();
                if (fail >= props.getMaxFailuresPerUser()) {
                    st.lockoutUntilEpochMs = now + Duration.ofMinutes(props.getLockoutMinutes()).toMillis();
                    metrics.counter("security.login.locked").increment();
                }
            }
        }

        // per-IP window
        if (ip != null && !ip.isBlank()) {
            IpWindow w = ips.computeIfAbsent(ip, k -> new IpWindow());
            long windowMs = Duration.ofMinutes(props.getIpWindowMinutes()).toMillis();
            if (now - w.startEpochMs >= windowMs) {
                w.startEpochMs = now;
                w.failures.set(0);
            }
            w.failures.incrementAndGet();
        }

        metrics.counter("security.login.attempts", "result", "failure").increment();
    }

    public void onSuccess(String username, String ip) {
        if (username != null && !username.isBlank()) {
            if (redis != null && isDistributed()) {
                String failKey = "fail:user:" + username.toLowerCase();
                try { redis.delete(failKey); } catch (Exception ignore) {}
            } else {
                UserState st = users.get(username.toLowerCase());
                if (st != null) {
                    st.failures.set(0);
                    st.lockoutUntilEpochMs = 0;
                }
            }
        }
        metrics.counter("security.login.attempts", "result", "success").increment();
    }

    private boolean isDistributed() {
        return props != null && props.isDistributedEnabled();
    }
}
