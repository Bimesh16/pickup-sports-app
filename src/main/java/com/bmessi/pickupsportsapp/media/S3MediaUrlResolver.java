package com.bmessi.pickupsportsapp.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.net.URI;
import java.time.Duration;

@Component
@ConditionalOnProperty(name = "app.media.storage.provider", havingValue = "s3")
public class S3MediaUrlResolver implements MediaUrlResolver {

    private final String bucket;
    private final String region;
    private final String endpoint;
    private final String prefix;
    private final String publicBaseUrl;
    private final boolean presignEnabled;
    private final int presignTtlSeconds;

    public S3MediaUrlResolver(
            @Value("${app.media.s3.bucket}") String bucket,
            @Value("${app.media.s3.region}") String region,
            @Value("${app.media.s3.endpoint:}") String endpoint,
            @Value("${app.media.s3.prefix:}") String prefix,
            @Value("${app.media.s3.public-base-url:}") String publicBaseUrl,
            @Value("${app.media.s3.presign.enabled:false}") boolean presignEnabled,
            @Value("${app.media.s3.presign.ttlSeconds:900}") int presignTtlSeconds
    ) {
        this.bucket = bucket;
        this.region = region;
        this.endpoint = endpoint;
        this.prefix = (prefix == null) ? "" : prefix.replaceFirst("^/+", "").replaceAll("/+$", "");
        this.publicBaseUrl = (publicBaseUrl == null) ? "" : publicBaseUrl.replaceAll("/+$", "");
        this.presignEnabled = presignEnabled;
        this.presignTtlSeconds = Math.max(60, presignTtlSeconds);
    }

    @Override
    public String publicUrlFor(String relativePath) {
        String key = key(relativePath);
        // Prefer static public URL if configured (e.g., CloudFront)
        if (!publicBaseUrl.isBlank()) {
            String r = key.startsWith("/") ? key : "/" + key;
            return publicBaseUrl + r;
        }
        if (!presignEnabled) {
            // Construct virtual-hosted–style URL as best-effort fallback
            return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
        }
        S3Presigner.Builder builder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create());
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }
        try (S3Presigner presigner = builder.build()) {
            GetObjectRequest get = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();
            GetObjectPresignRequest req = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(presignTtlSeconds))
                    .getObjectRequest(get)
                    .build();
            return presigner.presignGetObject(req).url().toString();
        }
    }

    @Override
    public String relativePathFromPublicUrl(String url) {
        // Attempt to strip public base URL or bucket URL to recover key
        if (!publicBaseUrl.isBlank()) {
            int idx = url.indexOf(publicBaseUrl);
            if (idx >= 0) {
                String rest = url.substring(idx + publicBaseUrl.length()).replaceFirst("^/", "");
                return unkey(rest);
            }
        }
        // Best-effort fallback: return last path segments after bucket domain or prefix
        String path = url.replaceFirst("^https?://[^/]+/", "");
        return unkey(path);
    }

    private String key(String relativePath) {
        String clean = relativePath.replace("\\", "/");
        while (clean.startsWith("/")) clean = clean.substring(1);
        return prefix.isBlank() ? clean : (prefix + "/" + clean);
    }

    private String unkey(String fullPath) {
        if (prefix.isBlank()) return fullPath;
        return fullPath.startsWith(prefix + "/") ? fullPath.substring((prefix + "/").length()) : fullPath;
    }
}
