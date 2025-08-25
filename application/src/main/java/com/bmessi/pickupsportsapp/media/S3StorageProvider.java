package com.bmessi.pickupsportsapp.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@ConditionalOnProperty(name = "app.media.storage.provider", havingValue = "s3")
public class S3StorageProvider implements StorageProvider {

    private final S3Client s3;
    private final String bucket;
    private final String prefix;

    public S3StorageProvider(
            @Value("${app.media.s3.bucket}") String bucket,
            @Value("${app.media.s3.region}") String region,
            @Value("${app.media.s3.endpoint:}") String endpoint,
            @Value("${app.media.s3.prefix:}") String prefix
    ) {
        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .serviceConfiguration(S3Configuration.builder().build());
        if (endpoint != null && !endpoint.isBlank()) {
            builder = builder.endpointOverride(URI.create(endpoint));
        }
        this.s3 = builder.build();
        this.bucket = bucket;
        this.prefix = (prefix == null) ? "" : prefix.replaceFirst("^/+", "").replaceAll("/+$", "");
    }

    @Override
    public Path store(String relativePath, InputStream in) throws IOException {
        String key = key(relativePath);
        byte[] bytes = toBytes(in);
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        s3.putObject(req, RequestBody.fromBytes(bytes));
        return Paths.get("/s3/" + key);
    }

    @Override
    public void delete(String relativePath) throws IOException {
        String key = key(relativePath);
        try {
            s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (Exception ignore) {
        }
    }

    @Override
    public Path resolve(String relativePath) {
        return Paths.get("/s3/" + key(relativePath));
    }

    private String key(String relativePath) {
        String clean = relativePath.replace("\\", "/");
        while (clean.startsWith("/")) clean = clean.substring(1);
        return prefix.isBlank() ? clean : prefix + "/" + clean;
    }

    private static byte[] toBytes(InputStream in) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream(64 * 1024);
        in.transferTo(baos);
        return baos.toByteArray();
    }
}
