package com.bmessi.pickupsportsapp.service.gameaccess;

public interface GameAccessService {
    boolean canAccessGame(Long gameId, String username);
    void invalidateForGame(Long gameId);
}
