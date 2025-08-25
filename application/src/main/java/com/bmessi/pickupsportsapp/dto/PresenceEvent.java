package com.bmessi.pickupsportsapp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PresenceEvent {
    public enum Type { JOIN, LEAVE, HEARTBEAT, SNAPSHOT }

    private Type type;
    private Long gameId;
    private String user;         // single user affected (JOIN/LEAVE/HEARTBEAT)
    private Set<String> users;   // full list for SNAPSHOT
    private long count;          // online count
    private Instant at;

    public PresenceEvent() {}
    public PresenceEvent(Type type, Long gameId, String user, Set<String> users, long count, Instant at) {
        this.type = type; this.gameId = gameId; this.user = user; this.users = users; this.count = count; this.at = at;
    }
    public static PresenceEvent snapshot(Long gameId, Set<String> users, long count) {
        return new PresenceEvent(Type.SNAPSHOT, gameId, null, users, count, Instant.now());
    }
    public static PresenceEvent join(Long gameId, String user, long count) {
        return new PresenceEvent(Type.JOIN, gameId, user, null, count, Instant.now());
    }
    public static PresenceEvent leave(Long gameId, String user, long count) {
        return new PresenceEvent(Type.LEAVE, gameId, user, null, count, Instant.now());
    }
    public static PresenceEvent beat(Long gameId, String user, long count) {
        return new PresenceEvent(Type.HEARTBEAT, gameId, user, null, count, Instant.now());
    }

    // getters/setters
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    public Set<String> getUsers() { return users; }
    public void setUsers(Set<String> users) { this.users = users; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
    public Instant getAt() { return at; }
    public void setAt(Instant at) { this.at = at; }
}
