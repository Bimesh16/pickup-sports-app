package com.bmessi.pickupsportsapp.controller.profile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Utility helpers for profile-related controllers.
 */
public final class ProfileUtils {

    private ProfileUtils() {
        // utility class
    }

    /**
     * Compute a weak ETag for the provided value.
     *
     * @param value the value to hash
     * @return a weak ETag string
     */
    public static String computeEtag(Object value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(String.valueOf(value).getBytes(StandardCharsets.UTF_8));
            String b64 = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
            return "W/\"" + b64 + "\"";
        } catch (Exception e) {
            return "W/\"" + Integer.toHexString(String.valueOf(value).hashCode()) + "\"";
        }
    }

    /**
     * Derive a thumbnail URL from an original image URL.
     *
     * @param originalUrl original image URL
     * @return derived thumbnail URL or {@code null} if the input is blank
     */
    public static String deriveThumbUrl(String originalUrl) {
        if (originalUrl == null || originalUrl.isBlank()) return null;
        int q = originalUrl.indexOf('?'); // preserve query if any
        String base = (q >= 0) ? originalUrl.substring(0, q) : originalUrl;
        String query = (q >= 0) ? originalUrl.substring(q) : "";

        // Only treat a '.' as an extension separator if it appears after the last '/'
        int lastSlash = base.lastIndexOf('/');
        int dot = base.lastIndexOf('.');
        boolean hasExtensionInPath = dot > lastSlash && dot < base.length() - 1;

        if (!hasExtensionInPath) {
            // No extension in the path segment; append _thumb at the end of the path
            return base + "_thumb" + query;
        }
        // Insert _thumb before the extension
        return base.substring(0, dot) + "_thumb" + base.substring(dot) + query;
    }
}
