package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "user_navigation_prefs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNavigationPrefs {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "preferred_layout")
    @Enumerated(EnumType.STRING)
    private NavigationLayout preferredLayout = NavigationLayout.AUTO;
    
    @Column(name = "show_tab_labels")
    private Boolean showTabLabels = true;
    
    @Column(name = "tab_animation_speed")
    private Integer tabAnimationSpeed = 300; // milliseconds
    
    @Column(name = "enable_haptic_feedback")
    private Boolean enableHapticFeedback = true;
    
    @Column(name = "enable_rtl")
    private Boolean enableRTL = false;
    
    @Column(name = "preferred_language")
    private String preferredLanguage = "en";
    
    @Column(name = "theme_preference")
    @Enumerated(EnumType.STRING)
    private ThemePreference themePreference = ThemePreference.SYSTEM;
    
    @Column(name = "high_contrast")
    private Boolean highContrast = false;
    
    @Column(name = "reduced_motion")
    private Boolean reducedMotion = false;
    
    public enum NavigationLayout {
        AUTO,        // Auto-detect based on screen size
        PILL_TABS,   // Force pill-shaped bottom tabs
        BENTO_MENU   // Force bento-style side menu
    }
    
    public enum ThemePreference {
        SYSTEM,      // Follow system theme
        LIGHT,       // Force light theme
        DARK         // Force dark theme
    }
    
    public static UserNavigationPrefs defaults(User user) {
        return UserNavigationPrefs.builder()
                .user(user)
                .preferredLayout(NavigationLayout.AUTO)
                .showTabLabels(true)
                .tabAnimationSpeed(300)
                .enableHapticFeedback(true)
                .enableRTL(false)
                .preferredLanguage("en")
                .themePreference(ThemePreference.SYSTEM)
                .highContrast(false)
                .reducedMotion(false)
                .build();
    }
}
