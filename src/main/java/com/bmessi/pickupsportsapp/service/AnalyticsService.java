package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.AnalyticsEvent;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.AnalyticsEventRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @Autowired
    private UserRepository userRepository;

    public void trackEvent(String username, String eventType, String eventCategory, String eventAction, String eventLabel, Long eventValue, Map<String, Object> properties) {
        User user = username != null ? userRepository.findByUsername(username) : null;
        
        AnalyticsEvent event = AnalyticsEvent.builder()
            .user(user)
            .eventType(eventType)
            .eventCategory(eventCategory)
            .eventAction(eventAction)
            .eventLabel(eventLabel)
            .eventValue(eventValue)
            .properties(properties != null ? properties.toString() : null)
            .build();
        
        analyticsEventRepository.save(event);
    }

    public UserAnalytics getUserAnalytics(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Mock analytics data - in real implementation, this would query the database
        return UserAnalytics.builder()
            .totalGamesPlayed(15)
            .totalGamesWon(8)
            .totalGamesLost(5)
            .totalGamesDrawn(2)
            .winRate(53.3)
            .averageRating(4.2)
            .totalHours(45.5)
            .favoriteSport("FUTSAL")
            .mostActiveDay("Saturday")
            .mostActiveTime("Evening")
            .totalDistanceTraveled(25.5)
            .totalMoneySpent(1500.0)
            .build();
    }

    public List<EventSummary> getEventHistory(String username, String eventType, int page, int size) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        List<AnalyticsEvent> events = analyticsEventRepository.findByUserAndEventTypeOrderByCreatedAtDesc(user, eventType);
        return events.stream()
            .map(this::convertToEventSummary)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getDashboardMetrics() {
        // Mock dashboard metrics - in real implementation, this would query the database
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", 1250);
        metrics.put("totalGames", 340);
        metrics.put("activeUsers", 890);
        metrics.put("totalRevenue", 45000.0);
        metrics.put("averageGameRating", 4.3);
        metrics.put("topSport", "FUTSAL");
        return metrics;
    }

    private EventSummary convertToEventSummary(AnalyticsEvent event) {
        return EventSummary.builder()
            .id(event.getId())
            .eventType(event.getEventType())
            .eventCategory(event.getEventCategory())
            .eventAction(event.getEventAction())
            .eventLabel(event.getEventLabel())
            .eventValue(event.getEventValue())
            .createdAt(event.getCreatedAt().toString())
            .build();
    }

    // DTOs
    @lombok.Data
    @lombok.Builder
    public static class UserAnalytics {
        private int totalGamesPlayed;
        private int totalGamesWon;
        private int totalGamesLost;
        private int totalGamesDrawn;
        private double winRate;
        private double averageRating;
        private double totalHours;
        private String favoriteSport;
        private String mostActiveDay;
        private String mostActiveTime;
        private double totalDistanceTraveled;
        private double totalMoneySpent;
    }

    @lombok.Data
    @lombok.Builder
    public static class EventSummary {
        private Long id;
        private String eventType;
        private String eventCategory;
        private String eventAction;
        private String eventLabel;
        private Long eventValue;
        private String createdAt;
    }
}
