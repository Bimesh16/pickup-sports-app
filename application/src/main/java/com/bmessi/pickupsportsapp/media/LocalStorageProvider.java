package com.bmessi.pickupsportsapp.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

@Component
@ConditionalOnProperty(name = "app.media.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageProvider implements StorageProvider {

    private final Path baseDir;

    public LocalStorageProvider(@Value("${app.media.base-path:./media}") String basePath) {
        this.baseDir = Paths.get(basePath).toAbsolutePath().normalize();
    }

    @Override
    public Path store(String relativePath, InputStream in) throws IOException {
        Path target = resolve(relativePath);
        Files.createDirectories(target.getParent());
        // Write atomically: tmp + move
        Path tmp = target.getParent().resolve(target.getFileName().toString() + ".tmp");
        Files.copy(in, tmp, StandardCopyOption.REPLACE_EXISTING);
        Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        return target;
    }

    @Override
    public void delete(String relativePath) throws IOException {
        Path p = resolve(relativePath);
        try {
            Files.deleteIfExists(p);
        } catch (NoSuchFileException ignore) {
        }
    }

    @Override
    public Path resolve(String relativePath) {
        String clean = relativePath.replace("\\", "/");
        while (clean.startsWith("/")) clean = clean.substring(1);
        return baseDir.resolve(clean).normalize();
    }
}
