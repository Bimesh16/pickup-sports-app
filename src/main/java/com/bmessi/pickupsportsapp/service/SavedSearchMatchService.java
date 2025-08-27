package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.SavedSearchEntity;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.SavedSearchRepository;
import com.bmessi.pickupsportsapp.service.push.PushSenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Background job that matches new games against saved searches and triggers alerts.
 */
@Service
@RequiredArgsConstructor
public class SavedSearchMatchService {

    private final SavedSearchRepository repo;
    private final PushSenderService pushSender;
    private final EmailService emailService;

    @Async
    public void handleNewGame(Game game) {
        List<SavedSearchEntity> searches = repo.findAll();
        for (SavedSearchEntity s : searches) {
            if (matches(s, game)) {
                pushSender.enqueue(s.getUser().getUsername(),
                        "New game: " + game.getSport(),
                        "Game at " + game.getLocation(),
                        "/games/" + game.getId());
                emailService.sendGameEventEmail(s.getUser().getUsername(),
                        "saved-search-match",
                        Map.of("sport", game.getSport(), "location", game.getLocation()));
            }
        }
    }

    boolean matches(SavedSearchEntity s, Game g) {
        boolean sport = s.getSport() == null || (g.getSport() != null && s.getSport().equalsIgnoreCase(g.getSport()));
        boolean loc = s.getLocation() == null || (g.getLocation() != null && g.getLocation().toLowerCase().contains(s.getLocation().toLowerCase()));
        return sport && loc;
    }
}
