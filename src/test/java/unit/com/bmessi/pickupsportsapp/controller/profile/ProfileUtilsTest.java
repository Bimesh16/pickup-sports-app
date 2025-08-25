package com.bmessi.pickupsportsapp.controller.profile;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProfileUtilsTest {

    @Test
    void computeEtagConsistentForSameInput() {
        String etag1 = ProfileUtils.computeEtag("value");
        String etag2 = ProfileUtils.computeEtag("value");
        assertEquals(etag1, etag2);
    }

    @Test
    void computeEtagDiffersForDifferentInput() {
        String etag1 = ProfileUtils.computeEtag("value1");
        String etag2 = ProfileUtils.computeEtag("value2");
        assertNotEquals(etag1, etag2);
    }

    @Test
    void deriveThumbUrlWithExtension() {
        String result = ProfileUtils.deriveThumbUrl("https://example.com/img.png");
        assertEquals("https://example.com/img_thumb.png", result);
    }

    @Test
    void deriveThumbUrlWithoutExtension() {
        String result = ProfileUtils.deriveThumbUrl("https://example.com/img");
        assertEquals("https://example.com/img_thumb", result);
    }

    @Test
    void deriveThumbUrlReturnsNullForBlank() {
        assertNull(ProfileUtils.deriveThumbUrl(""));
        assertNull(ProfileUtils.deriveThumbUrl(null));
    }
}
