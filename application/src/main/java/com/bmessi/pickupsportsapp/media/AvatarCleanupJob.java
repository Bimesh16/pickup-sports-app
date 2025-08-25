package com.bmessi.pickupsportsapp.media;

import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AvatarCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(AvatarCleanupJob.class);

    private final UserRepository userRepository;

    @Value("${app.media.base-path:./media}")
    private String basePath;

    @Value("${app.media.base-url:/media}")
    private String baseUrl;

    @Value("${app.media.cleanup.grace-minutes:10}")
    private long graceMinutes;

    // Run daily at 03:30 server time
    @Scheduled(cron = "0 30 3 * * *")
    public void cleanupOrphanedAvatars() {
        try {
            Path root = Paths.get(basePath).toAbsolutePath().normalize();
            Path avatarsDir = root.resolve("avatars");
            if (!Files.isDirectory(avatarsDir)) {
                return;
            }

            // Build set of used relative paths under "avatars"
            List<String> urls = userRepository.findAllAvatarUrls();
            Set<Path> usedFiles = new HashSet<>();
            String normalizedBase = trimTrailingSlash(baseUrl);

            for (String url : urls) {
                if (!StringUtils.hasText(url)) continue;
                if (!url.startsWith(normalizedBase + "/")) continue;

                String relative = url.substring(normalizedBase.length());
                if (relative.startsWith("/")) relative = relative.substring(1);
                if (!relative.startsWith("avatars/")) continue;

                Path candidate = root.resolve(relative).normalize();
                if (candidate.startsWith(root)) {
                    usedFiles.add(candidate);
                }
            }

            Instant cutoff = Instant.now().minus(Duration.ofMinutes(graceMinutes));
            int deleted = 0;

            // Walk avatars directory and delete files not in used set and older than cutoff
            Files.walkFileTree(avatarsDir, new SimpleFileVisitor<>() {
                @NotNull
                @Override
                public FileVisitResult visitFile(@NotNull Path file, BasicFileAttributes attrs) {
                    try {
                        if (!attrs.isRegularFile()) return FileVisitResult.CONTINUE;
                        if (usedFiles.contains(file)) return FileVisitResult.CONTINUE;

                        Instant lastModified = attrs.lastModifiedTime().toInstant();
                        if (lastModified.isAfter(cutoff)) return FileVisitResult.CONTINUE;

                        Files.deleteIfExists(file);
                        return FileVisitResult.CONTINUE;
                    } catch (Exception e) {
                        log.warn("Failed to delete orphaned avatar {}: {}", file, e.getMessage());
                        return FileVisitResult.CONTINUE;
                    }
                }
            });

            // Clean up empty user directories
            Files.walkFileTree(avatarsDir, new SimpleFileVisitor<>() {
                @NotNull
                @Override
                public FileVisitResult postVisitDirectory(@NotNull Path dir, java.io.IOException exc) {
                    try (var stream = Files.list(dir)) {
                        if (stream.findAny().isEmpty() && !dir.equals(avatarsDir)) {
                            Files.deleteIfExists(dir);
                        }
                    } catch (Exception ignored) {
                    }
                    return FileVisitResult.CONTINUE;
                }
            });

            log.info("Avatar cleanup completed under {}, used files: {}, cutoff: {}",
                    avatarsDir, usedFiles.size(), cutoff);
        } catch (Exception e) {
            log.warn("Avatar cleanup failed: {}", e.getMessage());
        }
    }

    private static String trimTrailingSlash(String s) {
        if (s == null || s.isBlank()) return "";
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}