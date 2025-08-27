package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.ExploreController;
import org.junit.jupiter.api.Test;
import support.Quarantined;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

@Quarantined
public class ExploreCursorUtilsTest {

    @Test
    void encodeDecodeRoundtrip() throws Exception {
        long ms = Instant.now().toEpochMilli();
        long id = 12345L;

        // access private static encodeCursor
        Method enc = ExploreController.class.getDeclaredMethod("encodeCursor", long.class, Long.class);
        enc.setAccessible(true);
        String cursor = (String) enc.invoke(null, ms, id);
        assertNotNull(cursor);

        // verify structure
        byte[] raw = Base64.getUrlDecoder().decode(cursor);
        String payload = new String(raw, StandardCharsets.UTF_8);
        assertTrue(payload.contains(":"));

        // access private static decodeCursor
        Method dec = ExploreController.class.getDeclaredMethod("decodeCursor", String.class);
        dec.setAccessible(true);
        Object decoded = dec.invoke(null, cursor);
        assertNotNull(decoded);

        // check fields via reflection (records)
        var comps = decoded.getClass().getRecordComponents();
        var timeField = comps[0];
        var idField = comps[1];

        OffsetDateTime time = (OffsetDateTime) timeField.getAccessor().invoke(decoded);
        Long rid = (Long) idField.getAccessor().invoke(decoded);

        assertEquals(id, rid);
        assertEquals(ms, time.toInstant().toEpochMilli());
    }
}
