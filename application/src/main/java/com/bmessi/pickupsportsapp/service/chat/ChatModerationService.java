package com.bmessi.pickupsportsapp.service.chat;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages per-game moderation lists for chat: mute and kick.
 * Backed by Redis sets when available, falling back to in-memory sets otherwise.
 */
@Service
public class ChatModerationService {

    private final Optional<StringRedisTemplate> redis;

    // fallback: gameId -> set of usernames
    private final ConcurrentHashMap<Long, Set<String>> mutes = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Set<String>> kicks = new ConcurrentHashMap<>();

    public ChatModerationService(Optional<StringRedisTemplate> redis) {
        this.redis = redis;
    }

    // Mutes
    public void mute(Long gameId, String username) {
        String user = norm(username);
        if (redis.isPresent()) {
            redis.get().opsForSet().add(muteKey(gameId), user);
        } else {
            mutes.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(user);
        }
    }

    public void unmute(Long gameId, String username) {
        String user = norm(username);
        if (redis.isPresent()) {
            redis.get().opsForSet().remove(muteKey(gameId), user);
        } else {
            mutes.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).remove(user);
        }
    }

    public boolean isMuted(Long gameId, String username) {
        String user = norm(username);
        if (redis.isPresent()) {
            Boolean member = redis.get().opsForSet().isMember(muteKey(gameId), user);
            return Boolean.TRUE.equals(member);
        } else {
            return mutes.getOrDefault(gameId, Set.of()).contains(user);
        }
    }

    public List<String> listMutes(Long gameId) {
        if (redis.isPresent()) {
            Set<String> members = redis.get().opsForSet().members(muteKey(gameId));
            List<String> list = members == null ? List.of() : new ArrayList<>(members);
            list.sort(String::compareToIgnoreCase);
            return list;
        } else {
            List<String> list = new ArrayList<>(mutes.getOrDefault(gameId, Set.of()));
            list.sort(String::compareToIgnoreCase);
            return list;
        }
    }

    // Kicks
    public void kick(Long gameId, String username) {
        String user = norm(username);
        if (redis.isPresent()) {
            redis.get().opsForSet().add(kickKey(gameId), user);
        } else {
            kicks.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(user);
        }
    }

    public void unkick(Long gameId, String username) {
        String user = norm(username);
        if (redis.isPresent()) {
            redis.get().opsForSet().remove(kickKey(gameId), user);
        } else {
            kicks.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).remove(user);
        }
    }

    public boolean isKicked(Long gameId, String username) {
        String user = norm(username);
        if (redis.isPresent()) {
            Boolean member = redis.get().opsForSet().isMember(kickKey(gameId), user);
            return Boolean.TRUE.equals(member);
        } else {
            return kicks.getOrDefault(gameId, Set.of()).contains(user);
        }
    }

    public List<String> listKicks(Long gameId) {
        if (redis.isPresent()) {
            Set<String> members = redis.get().opsForSet().members(kickKey(gameId));
            List<String> list = members == null ? List.of() : new ArrayList<>(members);
            list.sort(String::compareToIgnoreCase);
            return list;
        } else {
            List<String> list = new ArrayList<>(kicks.getOrDefault(gameId, Set.of()));
            list.sort(String::compareToIgnoreCase);
            return list;
        }
    }

    private static String muteKey(Long gameId) {
        return "chat:mute:game:" + gameId;
    }

    private static String kickKey(Long gameId) {
        return "chat:kick:game:" + gameId;
    }

    private static String norm(String s) {
        return s == null ? "" : s.trim();
    }
}
