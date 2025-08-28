package com.bmessi.pickupsportsapp.entity.tenant;

/**
 * Enumeration of tenant types for multi-tenant architecture.
 * 
 * <p>This enum defines the various types of organizations that can use the platform,
 * each with different business models, requirements, and feature sets.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
public enum TenantType {
    
    /**
     * Local sports clubs and organizations.
     * Focus on community sports and recreational activities.
     */
    SPORTS_CLUB("Sports Club", "Local sports clubs and community organizations"),
    
    /**
     * Venue and facility management companies.
     * Manage multiple sports facilities and venues.
     */
    FACILITY_OWNER("Facility Owner", "Venue and facility management companies"),
    
    /**
     * Sports league and tournament organizers.
     * Organize competitive sports events and leagues.
     */
    LEAGUE_ORGANIZER("League Organizer", "Sports league and tournament organizers"),
    
    /**
     * Corporate wellness and team building programs.
     * Focus on employee engagement and corporate sports.
     */
    CORPORATE("Corporate", "Corporate wellness and team building programs"),
    
    /**
     * Schools, universities, and educational institutions.
     * Manage sports programs for students and staff.
     */
    EDUCATIONAL("Educational", "Schools, universities, and educational institutions"),
    
    /**
     * City and government sports programs.
     * Municipal sports facilities and community programs.
     */
    MUNICIPAL("Municipal", "City and government sports programs"),
    
    /**
     * Multi-location sports business franchises.
     * Franchise operations with multiple locations.
     */
    FRANCHISE("Franchise", "Multi-location sports business franchises");
    
    private final String displayName;
    private final String description;
    
    TenantType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
