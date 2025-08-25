package com.bmessi.pickupsportsapp.service.search;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@AutoConfigureTestDatabase
@TestPropertySource(properties = {
        "geo.postgis.force-fallback=true"
})
class GeospatialSearchServiceFallbackTest {

    @Autowired
    GeospatialSearchService service;

    @Test
    void findNearby_worksWithFallback() {
        List<com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO> res =
                service.findNearby(37.7749, -122.4194, 2.0, 10);
        assertNotNull(res);
    }
}
