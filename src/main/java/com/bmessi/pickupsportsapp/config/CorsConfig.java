package com.bmessi.pickupsportsapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Apply CORS to all REST endpoints; narrow the path if needed.
        registry.addMapping("/**")
                .allowedOrigins(parseOrigins(allowedOrigins))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders(
                        "Authorization", "Content-Type", "Accept", "If-None-Match",
                        "If-Match", "If-Modified-Since", "If-Unmodified-Since", "Idempotency-Key", "Prefer"
                )
                .exposedHeaders(
                        "ETag", "Last-Modified", "Cache-Control", "X-Total-Count",
                        "Preference-Applied", "Link", "X-Recommendation-Source"
                )
                .allowCredentials(true)
                .maxAge(3600);
    }

    private String[] parseOrigins(String csv) {
        return csv == null || csv.isBlank()
                ? new String[] { "*" }
                : csv.split("\\s*,\\s*");
    }
}
