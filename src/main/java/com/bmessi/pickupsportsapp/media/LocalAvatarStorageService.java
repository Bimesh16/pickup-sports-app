package com.bmessi.pickupsportsapp.media;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.Iterator;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalAvatarStorageService implements AvatarStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalAvatarStorageService.class);

    private static final Set<String> ALLOWED_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    // Normalize output to JPEG
    private static final String OUTPUT_FORMAT = "jpg";

    @Value("${app.media.base-path:./media}")
    private String basePath;

    @Value("${app.media.base-url:/media}")
    private String baseUrl;

    @Value("${app.media.max-avatar-bytes:2097152}") // 2 MB default
    private long maxAvatarBytes;

    @Value("${app.media.max-avatar-width:512}")
    private int maxWidth;

    @Value("${app.media.max-avatar-height:512}")
    private int maxHeight;

    @Override
    public String store(String username, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file must not be empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, or WEBP images are allowed");
        }
        if (file.getSize() > maxAvatarBytes) {
            throw new IllegalArgumentException("Avatar exceeds max allowed size");
        }

        // 1) Decode image safely
        BufferedImage source = readImage(file);
        if (source == null) {
            throw new IllegalArgumentException("Invalid image content");
        }

        // 2) Resize if needed (keep aspect ratio)
        BufferedImage resized = resizeIfNeeded(source, maxWidth, maxHeight);

        // 3) Convert to RGB and composite alpha over white (for PNG/WEBP with transparency)
        BufferedImage rgb = ensureOpaqueRgb(resized);

        // 4) Encode to JPEG with compression (strips metadata)
        byte[] jpegBytes = encodeJpeg(rgb, 0.9f);

        // 5) Save atomically to disk
        String safeUser = sanitize(username);
        String filename = safeUser + "_" + Instant.now().toEpochMilli() + "_" + UUID.randomUUID() + "." + OUTPUT_FORMAT;

        Path root = Paths.get(basePath).toAbsolutePath().normalize();
        Path userDir = root.resolve("avatars").resolve(safeUser);
        Path target = userDir.resolve(filename);

        try {
            Files.createDirectories(userDir);
            Path tmp = Files.createTempFile(userDir, "upload_", "." + OUTPUT_FORMAT);
            Files.write(tmp, jpegBytes, StandardOpenOption.TRUNCATE_EXISTING);
            Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            log.error("Failed to store avatar for user {}: {}", username, e.getMessage());
            throw new IllegalStateException("Failed to store avatar", e);
        }

        return String.format("%s/avatars/%s/%s", trimTrailingSlash(baseUrl), safeUser, filename);
    }

    @Override
    public void delete(String publicUrl) {
        if (!StringUtils.hasText(publicUrl)) return;

        try {
            String normalizedBase = trimTrailingSlash(baseUrl);
            if (!publicUrl.startsWith(normalizedBase + "/")) return;

            String relative = publicUrl.substring(normalizedBase.length());
            if (relative.startsWith("/")) relative = relative.substring(1);
            if (!relative.startsWith("avatars/")) return;

            Path root = Paths.get(basePath).toAbsolutePath().normalize();
            Path target = root.resolve(relative).normalize();

            if (!target.startsWith(root)) return;

            Files.deleteIfExists(target);
        } catch (Exception e) {
            log.warn("Failed to delete avatar {}: {}", publicUrl, e.getMessage());
        }
    }

    // --- Image helpers ---

    private static BufferedImage readImage(MultipartFile file) {
        try {
            BufferedImage img = ImageIO.read(file.getInputStream());
            // ImageIO.read returns null if the input is not a known image
            return img;
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read image", e);
        }
    }

    private static BufferedImage resizeIfNeeded(BufferedImage src, int maxW, int maxH) {
        int w = src.getWidth();
        int h = src.getHeight();
        if (w <= 0 || h <= 0) throw new IllegalArgumentException("Invalid image dimensions");

        if (w <= maxW && h <= maxH) {
            return src;
        }
        double scale = Math.min((double) maxW / w, (double) maxH / h);
        int newW = Math.max(1, (int) Math.round(w * scale));
        int newH = Math.max(1, (int) Math.round(h * scale));

        BufferedImage dst = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = dst.createGraphics();
        try {
            g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.drawImage(src, 0, 0, newW, newH, null);
        } finally {
            g2.dispose();
        }
        return dst;
    }

    private static BufferedImage ensureOpaqueRgb(BufferedImage src) {
        // Create RGB target and paint a white background, then draw the image
        BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = rgb.createGraphics();
        try {
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
            g2.drawImage(src, 0, 0, null);
        } finally {
            g2.dispose();
        }
        return rgb;
    }

    private static byte[] encodeJpeg(BufferedImage img, float quality) {
        try {
            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
            if (!writers.hasNext()) writers = ImageIO.getImageWritersByFormatName("jpg");
            if (!writers.hasNext()) throw new IllegalStateException("No JPEG writers available");

            ImageWriter writer = writers.next();
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                 MemoryCacheImageOutputStream ios = new MemoryCacheImageOutputStream(baos)) {
                writer.setOutput(ios);
                ImageWriteParam param = writer.getDefaultWriteParam();
                if (param.canWriteCompressed()) {
                    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                    // Clamp between 0.0 and 1.0
                    float q = Math.max(0f, Math.min(1f, quality));
                    param.setCompressionQuality(q);
                }
                writer.write(null, new IIOImage(img, null, null), param);
                writer.dispose();
                return baos.toByteArray();
            } finally {
                try {
                    writer.dispose();
                } catch (Exception ignored) {
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to encode image to JPEG", e);
        }
    }

    // --- Utils ---

    private static String sanitize(String value) {
        if (!StringUtils.hasText(value)) return "user";
        return value.replaceAll("[^A-Za-z0-9_-]", "_");
    }

    private static String trimTrailingSlash(String s) {
        if (s == null || s.isBlank()) return "";
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}