package com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.entity.notification.NotificationTemplate;
import com.bmessi.pickupsportsapp.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for managing notification templates and processing template variables.
 * 
 * Features:
 * - Template resolution with locale fallback
 * - Variable substitution with placeholders like {{username}}, {{gameTime}}
 * - Caching for performance
 * - HTML and plain text template support
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationTemplateService {

    private final NotificationTemplateRepository templateRepository;
    
    // Pattern to match template variables like {{username}}, {{gameLocation}}
    private static final Pattern TEMPLATE_VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");

    /**
     * Get template for event type, channel, and locale with fallback to 'en'.
     */
    @Cacheable(cacheNames = "notification-templates", 
               key = "'template_' + #eventType + '_' + #channel + '_' + #locale")
    public NotificationTemplate getTemplate(String eventType, 
                                          NotificationTemplate.NotificationChannel channel, 
                                          String locale) {
        
        // Try to find exact match first
        return templateRepository.findActiveTemplate(eventType, channel, locale)
            .orElseGet(() -> {
                // Fallback to templates with locale preference
                List<NotificationTemplate> templates = templateRepository
                    .findTemplateWithFallback(eventType, channel, locale);
                
                if (!templates.isEmpty()) {
                    return templates.get(0);
                }
                
                // Last resort: create a basic template
                return createFallbackTemplate(eventType, channel, locale);
            });
    }

    /**
     * Process a template string by replacing variables with context values.
     */
    public String processTemplate(String template, Map<String, Object> context) {
        if (template == null || template.isEmpty()) {
            return template;
        }

        if (context == null) {
            context = new HashMap<>();
        }

        String result = template;
        Matcher matcher = TEMPLATE_VARIABLE_PATTERN.matcher(template);
        
        while (matcher.find()) {
            String variableName = matcher.group(1).trim();
            String placeholder = matcher.group(0); // Full match including {{}}
            
            Object value = getContextValue(context, variableName);
            String replacement = value != null ? value.toString() : "";
            
            result = result.replace(placeholder, replacement);
        }
        
        return result;
    }

    /**
     * Get a value from the context map, supporting nested keys like 'game.location'.
     */
    @SuppressWarnings("unchecked")
    private Object getContextValue(Map<String, Object> context, String key) {
        if (key == null || key.isEmpty()) {
            return null;
        }
        
        // Handle nested keys like 'game.location'
        String[] keyParts = key.split("\\.");
        Object value = context;
        
        for (String keyPart : keyParts) {
            if (value instanceof Map) {
                value = ((Map<String, Object>) value).get(keyPart);
            } else {
                return null;
            }
            
            if (value == null) {
                break;
            }
        }
        
        return value;
    }

    /**
     * Create a fallback template when no specific template is found.
     */
    private NotificationTemplate createFallbackTemplate(String eventType, 
                                                       NotificationTemplate.NotificationChannel channel, 
                                                       String locale) {
        
        String title = generateFallbackTitle(eventType);
        String message = generateFallbackMessage(eventType);
        
        return NotificationTemplate.builder()
            .eventType(eventType)
            .channel(channel)
            .locale(locale)
            .title(title)
            .message(message)
            .priority(NotificationTemplate.NotificationPriority.NORMAL)
            .active(true)
            .build();
    }

    /**
     * Generate a basic title for unknown event types.
     */
    private String generateFallbackTitle(String eventType) {
        switch (eventType) {
            case "game_joined":
                return "Game Update";
            case "game_cancelled":
                return "Game Cancelled";
            case "game_reminder":
                return "Game Reminder";
            case "waitlist_promoted":
                return "You're In!";
            case "game_updated":
                return "Game Changed";
            default:
                return "Notification";
        }
    }

    /**
     * Generate a basic message for unknown event types.
     */
    private String generateFallbackMessage(String eventType) {
        switch (eventType) {
            case "game_joined":
                return "{{actorUsername}} joined your {{sport}} game at {{location}}.";
            case "game_cancelled":
                return "The {{sport}} game at {{location}} on {{gameTime}} has been cancelled.";
            case "game_reminder":
                return "Your {{sport}} game at {{location}} starts in 2 hours.";
            case "waitlist_promoted":
                return "Great news! You've been moved from the waitlist to the {{sport}} game at {{location}}.";
            case "game_updated":
                return "The {{sport}} game at {{location}} has been updated.";
            default:
                return "You have a new notification about {{eventType}}.";
        }
    }

    /**
     * Create default templates for common game events.
     */
    public void createDefaultTemplates() {
        createDefaultGameTemplates();
        log.info("Created default notification templates");
    }

    /**
     * Create templates for game-related events.
     */
    private void createDefaultGameTemplates() {
        // Game joined templates
        createTemplate("game_joined", NotificationTemplate.NotificationChannel.IN_APP, "en",
            "New Player Joined", 
            "{{actorUsername}} joined your {{sport}} game at {{location}}",
            null);

        createTemplate("game_joined", NotificationTemplate.NotificationChannel.EMAIL, "en",
            "Someone Joined Your Game", 
            "Hi {{recipientUsername}}, {{actorUsername}} just joined your {{sport}} game at {{location}} on {{gameTime}}.",
            "<h2>Someone Joined Your Game!</h2><p>Hi {{recipientUsername}},</p><p><strong>{{actorUsername}}</strong> just joined your <strong>{{sport}}</strong> game at <strong>{{location}}</strong> on <strong>{{gameTime}}</strong>.</p><p>Current participants: {{participantCount}}/{{capacity}}</p>");

        createTemplate("game_joined", NotificationTemplate.NotificationChannel.PUSH, "en",
            "Player Joined", 
            "{{actorUsername}} joined your {{sport}} game",
            null);

        // Game cancelled templates
        createTemplate("game_cancelled", NotificationTemplate.NotificationChannel.IN_APP, "en",
            "Game Cancelled", 
            "The {{sport}} game at {{location}} on {{gameTime}} has been cancelled",
            null);

        createTemplate("game_cancelled", NotificationTemplate.NotificationChannel.EMAIL, "en",
            "Game Cancelled", 
            "Unfortunately, the {{sport}} game at {{location}} on {{gameTime}} has been cancelled.",
            "<h2>Game Cancelled</h2><p>Unfortunately, the <strong>{{sport}}</strong> game at <strong>{{location}}</strong> on <strong>{{gameTime}}</strong> has been cancelled.</p><p>{{cancellationReason}}</p>");

        // Waitlist promotion templates
        createTemplate("waitlist_promoted", NotificationTemplate.NotificationChannel.IN_APP, "en",
            "You're In!", 
            "Great news! You've been moved from the waitlist to the {{sport}} game at {{location}}",
            null);

        createTemplate("waitlist_promoted", NotificationTemplate.NotificationChannel.EMAIL, "en",
            "You're Off the Waitlist!", 
            "Great news! A spot opened up and you're now confirmed for the {{sport}} game at {{location}}.",
            "<h2>You're Off the Waitlist!</h2><p>Great news! A spot opened up and you're now confirmed for the <strong>{{sport}}</strong> game at <strong>{{location}}</strong> on <strong>{{gameTime}}</strong>.</p><p>See you there!</p>");

        // Game reminder templates
        createTemplate("game_reminder", NotificationTemplate.NotificationChannel.IN_APP, "en",
            "Game Starting Soon", 
            "Your {{sport}} game at {{location}} starts in {{timeUntil}}",
            null);

        createTemplate("game_reminder", NotificationTemplate.NotificationChannel.PUSH, "en",
            "Game Reminder", 
            "Your {{sport}} game starts in {{timeUntil}}",
            null);
    }

    /**
     * Helper method to create and save a template.
     */
    private void createTemplate(String eventType, 
                               NotificationTemplate.NotificationChannel channel, 
                               String locale,
                               String title, 
                               String message, 
                               String htmlContent) {
        
        // Check if template already exists
        if (templateRepository.findActiveTemplate(eventType, channel, locale).isPresent()) {
            return; // Template already exists
        }

        NotificationTemplate template = NotificationTemplate.builder()
            .eventType(eventType)
            .channel(channel)
            .locale(locale)
            .title(title)
            .message(message)
            .htmlContent(htmlContent)
            .priority(NotificationTemplate.NotificationPriority.NORMAL)
            .active(true)
            .build();

        templateRepository.save(template);
    }
}
