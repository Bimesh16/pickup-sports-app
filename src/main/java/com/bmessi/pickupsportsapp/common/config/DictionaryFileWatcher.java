package com.bmessi.pickupsportsapp.common.config;

import com.bmessi.pickupsportsapp.common.config.properties.ProfanityFilterProperties;
import com.bmessi.pickupsportsapp.service.chat.ProfanityFilterService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.nio.file.*;

@Configuration
public class DictionaryFileWatcher {

    private static final Logger log = LoggerFactory.getLogger(DictionaryFileWatcher.class);

    private final ProfanityFilterProperties props;
    private final ProfanityFilterService moderation;

    private Thread watcherThread;
    private volatile boolean running = false;

    public DictionaryFileWatcher(ProfanityFilterProperties props, ProfanityFilterService moderation) {
        this.props = props;
        this.moderation = moderation;
    }

    @PostConstruct
    public void start() {
        String path = props.getDictionaryPath();
        if (!props.isReloadOnChange() || path == null || path.isBlank()) return;

        Path filePath;
        if (path.startsWith("file:")) {
            filePath = Paths.get(path.substring("file:".length()));
        } else if (!path.startsWith("classpath:")) {
            filePath = Paths.get(path);
        } else {
            // classpath resources can't be watched
            return;
        }
        Path dir = filePath.getParent();
        if (dir == null) return;

        running = true;
        watcherThread = new Thread(() -> watchLoop(dir, filePath.getFileName()), "moderation-dict-watcher");
        watcherThread.setDaemon(true);
        watcherThread.start();
        log.info("Started dictionary file watcher for {}", filePath);
    }

    @PreDestroy
    public void stop() {
        running = false;
        if (watcherThread != null) watcherThread.interrupt();
    }

    private void watchLoop(Path dir, Path targetFile) {
        try (WatchService ws = FileSystems.getDefault().newWatchService()) {
            dir.register(ws, StandardWatchEventKinds.ENTRY_MODIFY, StandardWatchEventKinds.ENTRY_CREATE);
            while (running) {
                WatchKey key = ws.take();
                for (WatchEvent<?> ev : key.pollEvents()) {
                    Path changed = (Path) ev.context();
                    if (changed != null && changed.getFileName().equals(targetFile)) {
                        log.info("Dictionary file changed: {} -> reloading", changed);
                        try {
                            moderation.reloadFromFile();
                        } catch (Exception e) {
                            log.warn("Failed to reload dictionary: {}", e.getMessage());
                        }
                    }
                }
                key.reset();
            }
        } catch (Exception e) {
            if (running) {
                log.warn("Dictionary watcher error: {}", e.getMessage());
            }
        }
    }
}
