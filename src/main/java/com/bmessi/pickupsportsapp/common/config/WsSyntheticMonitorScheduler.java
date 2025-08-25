package com.bmessi.pickupsportsapp.common.config;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

@Component
@RequiredArgsConstructor
public class WsSyntheticMonitorScheduler {

    private static final Logger log = LoggerFactory.getLogger(WsSyntheticMonitorScheduler.class);

    private final MeterRegistry metrics;

    @Value("${slo.ws.url:}")
    private String wsUrl;

    @Value("${slo.ws.timeout-ms:5000}")
    private int timeoutMs;

    // Every 5 minutes by default
    @Scheduled(fixedDelayString = "${slo.ws.fixed-delay-ms:300000}")
    public void checkWs() {
        if (wsUrl == null || wsUrl.isBlank()) return;
        try {
            HttpClient client = HttpClient.newHttpClient();
            CompletableFuture<WebSocket> fut = client.newWebSocketBuilder()
                    .connectTimeout(Duration.ofMillis(timeoutMs))
                    .buildAsync(URI.create(wsUrl), new WebSocket.Listener() {
                        @Override
                        public void onOpen(WebSocket webSocket) {
                            webSocket.sendClose(WebSocket.NORMAL_CLOSURE, "ok");
                            WebSocket.Listener.super.onOpen(webSocket);
                        }
                        @Override
                        public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
                            return WebSocket.Listener.super.onClose(webSocket, statusCode, reason);
                        }
                    });
            fut.get();
            try { metrics.counter("synthetic.ws", "result", "ok").increment(); } catch (Exception ignore) {}
        } catch (Exception e) {
            log.warn("WS synthetic failed: {}", e.toString());
            try { metrics.counter("synthetic.ws", "result", "err").increment(); } catch (Exception ignore) {}
        }
    }
}
