package com.bmessi.pickupsportsapp.media;

/**
 * Resolves public URLs for stored media and maps them back to relative paths.
 */
public interface MediaUrlResolver {

    /**
     * Builds a public URL for the given relative storage path.
     * Example: avatars/alice/123.jpg -> https://cdn.example.com/media/avatars/alice/123.jpg
     * or a presigned S3 URL when configured.
     */
    String publicUrlFor(String relativePath);

    /**
     * Attempts to derive the relative storage path from a previously produced public URL.
     */
    String relativePathFromPublicUrl(String url);
}
