package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Advanced search service for games with sophisticated filtering capabilities.
 * 
 * This service provides:
 * - Complex multi-criteria searches
 * - Location-based proximity filtering
 * - Time range and availability filtering
 * - Skill level and sport-specific searches
 * - Capacity and waitlist filtering
 * - Popular and trending game discovery
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameSearchService {

    private final GameRepository gameRepository;

    /**
     * Comprehensive search with all possible filters.
     */
    public Page<Game> searchGames(GameSearchCriteria criteria, Pageable pageable) {
        log.debug("Searching games with criteria: {}", criteria);
        
        Specification<Game> spec = buildSearchSpecification(criteria);
        
        return gameRepository.findAll(spec, pageable);
    }

    /**
     * Find games with available spots (not full).
     */
    public Page<Game> findAvailableGames(GameSearchCriteria criteria, Pageable pageable) {
        criteria.setOnlyAvailable(true);
        return searchGames(criteria, pageable);
    }

    /**
     * Find games by proximity to a location.
     */
    public Page<Game> findNearbyGames(Double latitude, Double longitude, Double radiusKm, 
                                     GameSearchCriteria criteria, Pageable pageable) {
        criteria.setLatitude(latitude);
        criteria.setLongitude(longitude);
        criteria.setRadiusKm(radiusKm != null ? radiusKm : 10.0); // Default 10km
        
        return searchGames(criteria, pageable);
    }

    /**
     * Find trending/popular games (high participant interest).
     */
    public Page<Game> findTrendingGames(GameSearchCriteria criteria, Pageable pageable) {
        criteria.setOrderByPopularity(true);
        return searchGames(criteria, pageable);
    }

    /**
     * Find games starting soon.
     */
    public Page<Game> findUpcomingGames(int hoursAhead, GameSearchCriteria criteria, Pageable pageable) {
        OffsetDateTime now = OffsetDateTime.now();
        criteria.setFromTime(now);
        criteria.setToTime(now.plusHours(hoursAhead));
        
        return searchGames(criteria, pageable);
    }

    /**
     * Build JPA Specification for complex search.
     */
    private Specification<Game> buildSearchSpecification(GameSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Basic status filtering - only show published/full games by default
            if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(criteria.getStatuses()));
            } else {
                predicates.add(root.get("status").in(
                    Game.GameStatus.PUBLISHED, Game.GameStatus.FULL
                ));
            }

            // Sport filtering
            if (criteria.getSport() != null && !criteria.getSport().trim().isEmpty()) {
                predicates.add(cb.like(
                    cb.lower(root.get("sport")), 
                    "%" + criteria.getSport().toLowerCase() + "%"
                ));
            }

            // Location filtering
            if (criteria.getLocation() != null && !criteria.getLocation().trim().isEmpty()) {
                predicates.add(cb.like(
                    cb.lower(root.get("location")), 
                    "%" + criteria.getLocation().toLowerCase() + "%"
                ));
            }

            // Time range filtering
            if (criteria.getFromTime() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("time"), criteria.getFromTime()));
            }
            if (criteria.getToTime() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("time"), criteria.getToTime()));
            }

            // Skill level filtering
            if (criteria.getSkillLevel() != null && !criteria.getSkillLevel().trim().isEmpty()) {
                predicates.add(cb.equal(
                    cb.lower(root.get("skillLevel")), 
                    criteria.getSkillLevel().toLowerCase()
                ));
            }

            // Game type filtering
            if (criteria.getGameType() != null) {
                predicates.add(cb.equal(root.get("gameType"), criteria.getGameType()));
            }

            // Capacity filtering
            if (criteria.getMinCapacity() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), criteria.getMinCapacity()));
            }
            if (criteria.getMaxCapacity() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("capacity"), criteria.getMaxCapacity()));
            }

            // Price filtering
            if (criteria.getMaxPricePerPlayer() != null) {
                predicates.add(cb.or(
                    cb.isNull(root.get("pricePerPlayer")),
                    cb.lessThanOrEqualTo(root.get("pricePerPlayer"), criteria.getMaxPricePerPlayer())
                ));
            }
            if (criteria.getOnlyFreeGames() != null && criteria.getOnlyFreeGames()) {
                predicates.add(cb.or(
                    cb.isNull(root.get("pricePerPlayer")),
                    cb.equal(root.get("pricePerPlayer"), 0)
                ));
            }

            // Availability filtering (games with spots available)
            if (criteria.getOnlyAvailable() != null && criteria.getOnlyAvailable()) {
                Subquery<Long> participantCountSubquery = query.subquery(Long.class);
                Root<Game> gameSubRoot = participantCountSubquery.from(Game.class);
                participantCountSubquery.select(cb.count(gameSubRoot.join("participants")))
                    .where(cb.equal(gameSubRoot.get("id"), root.get("id")));

                predicates.add(cb.or(
                    cb.isNull(root.get("capacity")),
                    cb.lessThan(participantCountSubquery, root.get("capacity"))
                ));
            }

            // Waitlist enabled filtering
            if (criteria.getHasWaitlist() != null) {
                predicates.add(cb.equal(root.get("waitlistEnabled"), criteria.getHasWaitlist()));
            }

            // Private/public filtering
            if (criteria.getOnlyPublic() != null && criteria.getOnlyPublic()) {
                predicates.add(cb.equal(root.get("isPrivate"), false));
            }

            // Weather dependent filtering
            if (criteria.getWeatherDependent() != null) {
                predicates.add(cb.equal(root.get("weatherDependent"), criteria.getWeatherDependent()));
            }

            // Equipment provided filtering
            if (criteria.getEquipmentProvided() != null && criteria.getEquipmentProvided()) {
                predicates.add(cb.isNotNull(root.get("equipmentProvided")));
                predicates.add(cb.notEqual(root.get("equipmentProvided"), ""));
            }

            // Creator filtering (exclude games created by specific user)
            if (criteria.getExcludeCreatorId() != null) {
                predicates.add(cb.notEqual(root.get("user").get("id"), criteria.getExcludeCreatorId()));
            }

            // Text search in description
            if (criteria.getSearchText() != null && !criteria.getSearchText().trim().isEmpty()) {
                String searchPattern = "%" + criteria.getSearchText().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("description")), searchPattern),
                    cb.like(cb.lower(root.get("sport")), searchPattern),
                    cb.like(cb.lower(root.get("location")), searchPattern)
                ));
            }

            // Proximity filtering (if coordinates provided)
            if (criteria.getLatitude() != null && criteria.getLongitude() != null && criteria.getRadiusKm() != null) {
                // Note: This is a simplified distance calculation
                // For production, you'd want to use PostGIS or similar for accurate geo queries
                double lat = criteria.getLatitude();
                double lon = criteria.getLongitude();
                double radius = criteria.getRadiusKm();
                
                // Simple bounding box approximation (not perfectly accurate but fast)
                double latOffset = radius / 111.0; // Rough km to degree conversion
                double lonOffset = radius / (111.0 * Math.cos(Math.toRadians(lat)));
                
                predicates.add(cb.and(
                    cb.isNotNull(root.get("latitude")),
                    cb.isNotNull(root.get("longitude")),
                    cb.between(root.get("latitude"), lat - latOffset, lat + latOffset),
                    cb.between(root.get("longitude"), lon - lonOffset, lon + lonOffset)
                ));
            }

            // Ordering
            if (criteria.getOrderByPopularity() != null && criteria.getOrderByPopularity()) {
                // Order by participant count (descending)
                Subquery<Long> participantCountSubquery = query.subquery(Long.class);
                Root<Game> gameSubRoot = participantCountSubquery.from(Game.class);
                participantCountSubquery.select(cb.count(gameSubRoot.join("participants")))
                    .where(cb.equal(gameSubRoot.get("id"), root.get("id")));
                
                query.orderBy(cb.desc(participantCountSubquery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Search criteria class for advanced game filtering.
     */
    public static class GameSearchCriteria {
        private String sport;
        private String location;
        private OffsetDateTime fromTime;
        private OffsetDateTime toTime;
        private String skillLevel;
        private Game.GameType gameType;
        private Integer minCapacity;
        private Integer maxCapacity;
        private java.math.BigDecimal maxPricePerPlayer;
        private Boolean onlyFreeGames;
        private Boolean onlyAvailable;
        private Boolean hasWaitlist;
        private Boolean onlyPublic;
        private Boolean weatherDependent;
        private Boolean equipmentProvided;
        private Long excludeCreatorId;
        private String searchText;
        private Double latitude;
        private Double longitude;
        private Double radiusKm;
        private Boolean orderByPopularity;
        private List<Game.GameStatus> statuses;

        // Getters and setters
        public String getSport() { return sport; }
        public void setSport(String sport) { this.sport = sport; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public OffsetDateTime getFromTime() { return fromTime; }
        public void setFromTime(OffsetDateTime fromTime) { this.fromTime = fromTime; }

        public OffsetDateTime getToTime() { return toTime; }
        public void setToTime(OffsetDateTime toTime) { this.toTime = toTime; }

        public String getSkillLevel() { return skillLevel; }
        public void setSkillLevel(String skillLevel) { this.skillLevel = skillLevel; }

        public Game.GameType getGameType() { return gameType; }
        public void setGameType(Game.GameType gameType) { this.gameType = gameType; }

        public Integer getMinCapacity() { return minCapacity; }
        public void setMinCapacity(Integer minCapacity) { this.minCapacity = minCapacity; }

        public Integer getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

        public java.math.BigDecimal getMaxPricePerPlayer() { return maxPricePerPlayer; }
        public void setMaxPricePerPlayer(java.math.BigDecimal maxPricePerPlayer) { this.maxPricePerPlayer = maxPricePerPlayer; }

        public Boolean getOnlyFreeGames() { return onlyFreeGames; }
        public void setOnlyFreeGames(Boolean onlyFreeGames) { this.onlyFreeGames = onlyFreeGames; }

        public Boolean getOnlyAvailable() { return onlyAvailable; }
        public void setOnlyAvailable(Boolean onlyAvailable) { this.onlyAvailable = onlyAvailable; }

        public Boolean getHasWaitlist() { return hasWaitlist; }
        public void setHasWaitlist(Boolean hasWaitlist) { this.hasWaitlist = hasWaitlist; }

        public Boolean getOnlyPublic() { return onlyPublic; }
        public void setOnlyPublic(Boolean onlyPublic) { this.onlyPublic = onlyPublic; }

        public Boolean getWeatherDependent() { return weatherDependent; }
        public void setWeatherDependent(Boolean weatherDependent) { this.weatherDependent = weatherDependent; }

        public Boolean getEquipmentProvided() { return equipmentProvided; }
        public void setEquipmentProvided(Boolean equipmentProvided) { this.equipmentProvided = equipmentProvided; }

        public Long getExcludeCreatorId() { return excludeCreatorId; }
        public void setExcludeCreatorId(Long excludeCreatorId) { this.excludeCreatorId = excludeCreatorId; }

        public String getSearchText() { return searchText; }
        public void setSearchText(String searchText) { this.searchText = searchText; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public Double getRadiusKm() { return radiusKm; }
        public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }

        public Boolean getOrderByPopularity() { return orderByPopularity; }
        public void setOrderByPopularity(Boolean orderByPopularity) { this.orderByPopularity = orderByPopularity; }

        public List<Game.GameStatus> getStatuses() { return statuses; }
        public void setStatuses(List<Game.GameStatus> statuses) { this.statuses = statuses; }

        @Override
        public String toString() {
            return "GameSearchCriteria{" +
                "sport='" + sport + '\'' +
                ", location='" + location + '\'' +
                ", skillLevel='" + skillLevel + '\'' +
                ", gameType=" + gameType +
                ", onlyAvailable=" + onlyAvailable +
                ", searchText='" + searchText + '\'' +
                '}';
        }
    }
}
