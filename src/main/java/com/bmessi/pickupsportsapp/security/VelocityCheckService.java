package com.bmessi.pickupsportsapp.security;

import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory velocity checker to detect rapid repeated actions.
 * Not a replacement for a full distributed rate limiter but sufficient
 * for basic suspicious activity detection and logging.
 */
@Service
public class VelocityCheckService {

    private final Map<String, Deque<Long>> events = new ConcurrentHashMap<>();

    /**
     * Record an action and check if it exceeds the provided limit within the window.
     *
     * @param key       unique key per user/ip/action combination
     * @param limit     max number of events allowed
     * @param windowMs  rolling time window in milliseconds
     * @return true if within limits, false if velocity exceeded
     */
    public boolean incrementAndCheck(String key, int limit, long windowMs) {
        long now = System.currentTimeMillis();
        Deque<Long> deque = events.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && now - deque.peekFirst() > windowMs) {
                deque.pollFirst();
            }
            deque.addLast(now);
            return deque.size() <= limit;
        }
    }
}

