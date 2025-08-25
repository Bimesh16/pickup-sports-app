package com.bmessi.pickupsportsapp.integration.xai;

import com.bmessi.pickupsportsapp.common.config.properties.XaiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "xai", name = "enabled", havingValue = "true")
public class XaiApiClientOkHttp implements XaiApiClient {

    private static final Logger log = LoggerFactory.getLogger(XaiApiClientOkHttp.class);

    // Extracted constants for clarity and reuse
    private static final int DEFAULT_TIMEOUT_MS = 3_000;
    private static final int MIN_TIMEOUT_MS = 1_000;
    private static final MediaType JSON = MediaType.parse("application/json");

    private final XaiProperties props;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Renamed for intent; introduced variables + constants; removed call to non-existent props.timeoutMs()
    private OkHttpClient buildClient() {
        int timeoutMs = Math.max(MIN_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
        Duration timeout = Duration.ofMillis(timeoutMs);
        return new OkHttpClient.Builder()
                .callTimeout(timeout)
                .connectTimeout(timeout)
                .readTimeout(timeout)
                .writeTimeout(timeout)
                .build();
    }

    @Override
    @Retry(name = "xai")
    @CircuitBreaker(name = "xai", fallbackMethod = "fallbackGetRecommendations")
    public Optional<List<RecommendationHint>> getRecommendations(String preferredSport, String location, int page, int size) {
        try {
            JsonNode body = objectMapper.createObjectNode()
                    .put("preferredSport", preferredSport != null ? preferredSport : "")
                    .put("location", location != null ? location : "")
                    .put("page", Math.max(page, 0))
                    .put("size", Math.max(size, 1));

            Request request = new Request.Builder()
                    // Renamed to existing properties
                    .url(props.baseUrl())
                    .header("Authorization", "Bearer " + props.apiKey())
                    .post(RequestBody.create(objectMapper.writeValueAsBytes(body), JSON))
                    .build();

            try (Response response = buildClient().newCall(request).execute()) {
                if (!response.isSuccessful() || response.body() == null) {
                    log.debug("XAI call failed: http={} body={}", response.code(),
                            response.body() != null ? response.body().string() : "null");
                    return Optional.empty();
                }

                String json = response.body().string();
                JsonNode root = objectMapper.readTree(json);

                JsonNode recs = root.get("recommendations");
                if (recs == null || !recs.isArray()) {
                    log.debug("XAI response missing 'recommendations' array");
                    return Optional.empty();
                }

                List<RecommendationHint> result = new ArrayList<>();
                for (JsonNode n : recs) {
                    String s = safeText(n, "sport");
                    String loc = safeText(n, "location");
                    Double score = n.hasNonNull("score") ? n.get("score").asDouble() : null;
                    if ((s != null && !s.isBlank()) || (loc != null && !loc.isBlank())) {
                        result.add(new RecommendationHint(s, loc, score));
                    }
                }
                return Optional.of(result);
            }
        } catch (Exception e) {
            log.debug("XAI call error: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<List<RecommendationHint>> fallbackGetRecommendations(String preferredSport,
                                                                         String location,
                                                                         int page,
                                                                         int size,
                                                                         Throwable t) {
        log.warn("XAI call fallback triggered: {}", t.toString());
        return Optional.empty();
    }

    private static String safeText(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }
}