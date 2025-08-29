package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Scheduled maintenance service for automatic game management.
 * 
 * This service runs periodic tasks to:
 * - Update game statuses automatically
 * - Clean up old completed games
 * - Handle overdue RSVP cutoffs
 * - Archive old games
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameMaintenanceService {

    private final GameRepository gameRepository;
    private final GameBusinessService gameBusinessService;

    /**
     * Updates game statuses every 5 minutes.
     * Marks games as completed when they're past their end time.
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void updateGameStatuses() {
        try {
            OffsetDateTime now = OffsetDateTime.now();
            
            // Find games that should be marked as completed
            List<Game> activeGames = gameRepository.findActiveGamesNeedingStatusUpdate(now);
            
            int updated = 0;
            for (Game game : activeGames) {
                gameBusinessService.updateGameStatusIfNeeded(game);
                updated++;
            }
            
            if (updated > 0) {
                log.info("Updated status for {} games", updated);
            }
            
        } catch (Exception e) {
            log.error("Error updating game statuses: {}", e.getMessage(), e);
        }
    }

    /**
     * Archives old completed games daily at 3 AM.
     * Games older than 30 days are moved to archived status.
     */
    @Scheduled(cron = "0 0 3 * * *") // Daily at 3 AM
    @Transactional
    public void archiveOldGames() {
        try {
            OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(30);
            
            int archived = gameRepository.updateOldCompletedGamesToArchived(cutoffDate);
            
            if (archived > 0) {
                log.info("Archived {} old completed games", archived);
            }
            
        } catch (Exception e) {
            log.error("Error archiving old games: {}", e.getMessage(), e);
        }
    }

    /**
     * Cleans up draft games that haven't been published.
     * Runs weekly on Sunday at 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * SUN") // Weekly on Sunday at 2 AM
    @Transactional
    public void cleanupStaleDraftGames() {
        try {
            OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(7);
            
            int deleted = gameRepository.deleteOldDraftGames(cutoffDate);
            
            if (deleted > 0) {
                log.info("Cleaned up {} stale draft games", deleted);
            }
            
        } catch (Exception e) {
            log.error("Error cleaning up draft games: {}", e.getMessage(), e);
        }
    }

    /**
     * Sends reminder notifications for games starting soon.
     * Runs every hour to check for games starting in the next few hours.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional(readOnly = true)
    public void sendGameReminders() {
        try {
            OffsetDateTime now = OffsetDateTime.now();
            OffsetDateTime reminderWindow = now.plusHours(2);
            
            // Find games starting in the next 2 hours that haven't had reminders sent
            List<Game> upcomingGames = gameRepository.findGamesNeedingReminders(now, reminderWindow);
            
            int remindersSent = 0;
            for (Game game : upcomingGames) {
                sendGameReminder(game);
                remindersSent++;
            }
            
            if (remindersSent > 0) {
                log.info("Sent reminders for {} upcoming games", remindersSent);
            }
            
        } catch (Exception e) {
            log.error("Error sending game reminders: {}", e.getMessage(), e);
        }
    }

    /**
     * Checks for games that need capacity or waitlist management.
     * Runs every 15 minutes during peak hours.
     */
    @Scheduled(fixedRate = 900000) // Every 15 minutes
    @Transactional
    public void manageLiveGameCapacity() {
        try {
            // Find games that might need waitlist promotion or status updates
            List<Game> activeGames = gameRepository.findGamesNeedingCapacityManagement();
            
            int managed = 0;
            for (Game game : activeGames) {
                manageGameCapacity(game);
                managed++;
            }
            
            if (managed > 0) {
                log.debug("Managed capacity for {} active games", managed);
            }
            
        } catch (Exception e) {
            log.error("Error managing game capacity: {}", e.getMessage(), e);
        }
    }

    /**
     * Sends reminder notification for an upcoming game.
     */
    private void sendGameReminder(Game game) {
        // This would integrate with your notification service
        // For now, just log the reminder
        log.info("Reminder: Game {} ({}) starting at {} with {} participants", 
            game.getId(), game.getSport(), game.getTime(), game.getParticipants().size());
        
        // TODO: Send actual notifications to participants
        // notificationService.sendGameReminder(game);
    }

    /**
     * Manages capacity for a specific game (promotes from waitlist if needed).
     */
    private void manageGameCapacity(Game game) {
        if (!Boolean.TRUE.equals(game.getWaitlistEnabled())) {
            return;
        }
        
        Integer capacity = game.getCapacity();
        if (capacity == null) {
            return;
        }
        
        int currentParticipants = game.getParticipants().size();
        
        // If there's space and people on waitlist, promote them
        if (currentParticipants < capacity) {
            int spotsAvailable = capacity - currentParticipants;
            for (int i = 0; i < spotsAvailable; i++) {
                User promoted = gameBusinessService.promoteFromWaitlist(game);
                if (promoted == null) {
                    break; // No more people on waitlist
                }
            }
        }
    }
}