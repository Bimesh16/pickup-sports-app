package com.bmessi.pickupsportsapp.media;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

public interface StorageProvider {
    /**
     * Stores the given stream at the target relative path (under the configured base path), creating directories if needed.
     * Returns the absolute filesystem path where the content was written.
     */
    Path store(String relativePath, InputStream in) throws IOException;

    /**
     * Deletes the file at the given relative path (if it exists).
     */
    void delete(String relativePath) throws IOException;

    /**
     * Resolves a relative path to an absolute filesystem path (without creating it).
     */
    Path resolve(String relativePath);
}
