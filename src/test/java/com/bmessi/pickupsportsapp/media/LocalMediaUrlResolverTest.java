package com.bmessi.pickupsportsapp.media;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LocalMediaUrlResolverTest {

    @Test
    void mapsRelativeToPublicAndBack() {
        LocalMediaUrlResolver r = new LocalMediaUrlResolver();
        // inject base url via reflection for test
        try {
            var f = LocalMediaUrlResolver.class.getDeclaredField("baseUrl");
            f.setAccessible(true);
            f.set(r, "/media");
        } catch (Exception e) {
            fail(e);
        }

        String rel = "avatars/alice/123.jpg";
        String url = r.publicUrlFor(rel);
        assertEquals("/media/avatars/alice/123.jpg", url);

        String back = r.relativePathFromPublicUrl(url);
        assertEquals(rel, back);
    }
}
