package com.bmessi.pickupsportsapp.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.media.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalMediaUrlResolver implements MediaUrlResolver {

    @Value("${app.media.base-url:/media}")
    private String baseUrl;

    @Override
    public String publicUrlFor(String relativePath) {
        String b = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String r = relativePath.startsWith("/") ? relativePath : "/" + relativePath;
        return b + r;
    }

    @Override
    public String relativePathFromPublicUrl(String url) {
        String b = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        int idx = url.indexOf(b);
        if (idx >= 0) {
            return url.substring(idx + b.length()).replaceFirst("^/", "");
        }
        // assume already relative
        return url.replaceFirst("^/", "");
    }
}
