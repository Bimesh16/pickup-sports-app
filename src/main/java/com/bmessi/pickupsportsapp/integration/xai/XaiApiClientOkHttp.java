package com.bmessi.pickupsportsapp.integration.xai;

import com.bmessi.pickupsportsapp.config.properties.XaiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class XaiApiClientOkHttp implements XaiApiClient {

    private static final Logger log = LoggerFactory.getLogger(XaiApiClientOkHttp.class);

    private final XaiProperties props;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private OkHttpClient client() {
        int timeout = Math.max(1000, props.timeoutMs()); // guard minimum
        return new OkHttpClient.Builder()
                .callTimeout(Duration.ofMillis(timeout))
                .connectTimeout(Duration.ofMillis(timeout))
                .readTimeout(Duration.ofMillis(timeout))
                .writeTimeout(Duration.ofMillis(timeout))
                .build();
    }

    @Override
    public Optional<List<RecommendationHint>> getRecommendations(String preferredSport, String location, int page, int size) {
        try {
            // Build request payload; adjust structure to match your provider
            JsonNode body = objectMapper.createObjectNode()
                    .put("preferredSport", preferredSport != null ? preferredSport : "")
                    .put("location", location != null ? location : "")
                    .put("page", Math.max(page, 0))
                    .put("size", Math.max(size, 1));

            Request request = new Request.Builder()
                    .url(props.url())
                    .header("Authorization", "Bearer " + props.key())
                    .header("Content-Type", "application/json")
                    .post(RequestBody.create(objectMapper.writeValueAsBytes(body), MediaType.parse("application/json")))
                    .build();

            try (Response response = client().newCall(request).execute()) {
                if (!response.isSuccessful() || response.body() == null) {
                    log.debug("XAI call failed: http={} body={}", response.code(), response.body() != null ? response.body().string() : "null");
                    return Optional.empty();
                }

                String json = response.body().string();
                JsonNode root = objectMapper.readTree(json);

                // Expected format (example):
                // {
                //   "recommendations": [
                //     { "sport": "Soccer", "location": "Park A", "score": 0.92 },
                //     { "sport": "Basketball", "location": "Court 3", "score": 0.81 }
                //   ]
                // }
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

    private static String safeText(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }
}