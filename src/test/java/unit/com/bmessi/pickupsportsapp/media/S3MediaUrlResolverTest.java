package unit.com.bmessi.pickupsportsapp.media;

import com.bmessi.pickupsportsapp.media.S3MediaUrlResolver;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class S3MediaUrlResolverTest {

    @Test
    void usesPublicBaseUrlWhenConfigured() {
        // Construct with public-base-url and presign disabled to avoid AWS presigner in unit test
        S3MediaUrlResolver r = new S3MediaUrlResolver(
                "bucket", "us-east-1", "", "app", "https://cdn.example.com", false, 900
        );
        String rel = "avatars/bob/xyz.png";
        String url = r.publicUrlFor(rel);
        assertEquals("https://cdn.example.com/app/avatars/bob/xyz.png", url);

        String back = r.relativePathFromPublicUrl(url);
        assertEquals(rel, back);
    }
}
