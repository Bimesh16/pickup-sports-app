package com.bmessi.pickupsportsapp.integration.xai;

import java.util.List;
import java.util.Optional;

public interface XaiApiClient {

    /**
     * Requests recommendations from the XAI service. Returns a best-effort list, or empty on errors/timeouts.
     * Parameters may be null/blank and the client will pass them as optional hints to the API.
     */
    Optional<List<RecommendationHint>> getRecommendations(String preferredSport, String location, int page, int size);

    /**
     * Lightweight DTO coming from the AI service to hint which records to prioritize.
     * You can extend with confidence/score if your API provides it.
     */
    record RecommendationHint(String sport, String location, Double score) {}
}