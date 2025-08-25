package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.api.PresignResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/media/s3")
@ConditionalOnProperty(name = "app.media.storage.provider", havingValue = "s3")
public class MediaPresignController {

    private final String bucket;
    private final String region;
    private final String endpoint;
    private final String prefix;
    private final boolean presignEnabled;
    private final int ttlSeconds;

    private final com.bmessi.pickupsportsapp.media.MediaUrlResolver urlResolver;

    public MediaPresignController(
            @org.springframework.beans.factory.annotation.Value("${app.media.s3.bucket}") String bucket,
            @org.springframework.beans.factory.annotation.Value("${app.media.s3.region}") String region,
            @org.springframework.beans.factory.annotation.Value("${app.media.s3.endpoint:}") String endpoint,
            @org.springframework.beans.factory.annotation.Value("${app.media.s3.prefix:}") String prefix,
            @org.springframework.beans.factory.annotation.Value("${app.media.s3.presign.enabled:false}") boolean presignEnabled,
            @org.springframework.beans.factory.annotation.Value("${app.media.s3.presign.ttlSeconds:900}") int ttlSeconds,
            com.bmessi.pickupsportsapp.media.MediaUrlResolver urlResolver
    ) {
        this.bucket = bucket;
        this.region = region;
        this.endpoint = endpoint;
        this.prefix = (prefix == null) ? "" : prefix.replaceFirst("^/+", "").replaceAll("/+$", "");
        this.presignEnabled = presignEnabled;
        this.ttlSeconds = Math.max(60, ttlSeconds);
        this.urlResolver = urlResolver;
    }

    @Operation(summary = "Presign S3 PUT upload", description = "Returns a presigned PUT URL for direct upload to S3 (provider=s3 and presign enabled)")
    @ApiResponse(responseCode = "200", description = "Presigned URL issued")
    @PostMapping("/presign")
    public ResponseEntity<PresignResponse> presign(@RequestBody Map<String, String> body) {
        if (!presignEnabled) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "S3 presign is disabled");
        }
        String relativePath = body.getOrDefault("path", "");
        if (relativePath.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "path is required");
        }
        String contentType = body.getOrDefault("contentType", "application/octet-stream");
        String key = key(relativePath);

        S3Presigner.Builder b = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create());
        if (endpoint != null && !endpoint.isBlank()) b.endpointOverride(URI.create(endpoint));

        try (S3Presigner presigner = b.build()) {
            PutObjectRequest put = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();
            PutObjectPresignRequest preq = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(ttlSeconds))
                    .putObjectRequest(put)
                    .build();
            String putUrl = presigner.presignPutObject(preq).url().toString();

            // Also provide GET URL (presigned or static via resolver)
            String getUrl;
            if (presignEnabled) {
                GetObjectRequest get = GetObjectRequest.builder().bucket(bucket).key(key).build();
                GetObjectPresignRequest greq = GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofSeconds(ttlSeconds))
                        .getObjectRequest(get)
                        .build();
                getUrl = presigner.presignGetObject(greq).url().toString();
            } else {
                getUrl = urlResolver.publicUrlFor(relativePath);
            }

            return ResponseEntity.ok(new com.bmessi.pickupsportsapp.dto.api.PresignResponse(
                    putUrl, getUrl, key, relativePath
            ));
        }
    }

    private String key(String relativePath) {
        String clean = relativePath.replace("\\", "/");
        while (clean.startsWith("/")) clean = clean.substring(1);
        return prefix.isBlank() ? clean : (prefix + "/" + clean);
    }
}
