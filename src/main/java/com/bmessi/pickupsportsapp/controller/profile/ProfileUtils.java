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
        int dot = base.lastIndexOf('.');
        if (dot <= 0 || dot == base.length() - 1) {
            // No extension; append _thumb
            return base + "_thumb" + query;
        }
        return base.substring(0, dot) + "_thumb" + base.substring(dot) + query;
    }
}
