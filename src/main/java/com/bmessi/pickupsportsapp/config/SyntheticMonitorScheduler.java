package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.config.properties.SloProperties;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class SyntheticMonitorScheduler {

    private static final Logger log = LoggerFactory.getLogger(SyntheticMonitorScheduler.class);

    private final SloProperties props;
    private final MeterRegistry metrics;

    private RestTemplate buildClient() {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(props.getSyntheticTimeoutMs());
        factory.setReadTimeout(props.getSyntheticTimeoutMs());
        return new RestTemplate(factory);
    }

    // Every 2 minutes
    @Scheduled(fixedDelayString = "${slo.synthetic.fixed-delay-ms:120000}")
    public void pingGamesList() {
        if (!props.isSyntheticEnabled()) return;
        String url = props.getBaseUrl() + "/api/v1/games?page=0&size=5";
        callAndRecord("synthetic.games.list", url);
    }

    // Every 5 minutes
    @Scheduled(fixedDelayString = "${slo.synthetic.nearby.fixed-delay-ms:300000}")
    public void pingNearby() {
        if (!props.isSyntheticEnabled()) return;
        String url = props.getBaseUrl() + "/api/v1/games/nearby?lat=37.7749&lon=-122.4194&radiusKm=1&limit=5";
        callAndRecord("synthetic.games.nearby", url);
    }

    private void callAndRecord(String name, String url) {
        long t0 = System.nanoTime();
        try {
            buildClient().getForEntity(url, String.class);
            long dur = System.nanoTime() - t0;
            try { metrics.timer(name, "result", "ok").record(dur, java.util.concurrent.TimeUnit.NANOSECONDS); } catch (Exception ignore) {}
        } catch (Exception e) {
            long dur = System.nanoTime() - t0;
            try {
                metrics.timer(name, "result", "err").record(dur, java.util.concurrent.TimeUnit.NANOSECONDS);
                metrics.counter(name + ".errors").increment();
            } catch (Exception ignore) {}
            log.warn("Synthetic check failed for {}: {}", url, e.toString());
        }
    }
}
