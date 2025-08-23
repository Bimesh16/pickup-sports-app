package com.bmessi.pickupsportsapp.media;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.Iterator;
import java.util.Locale;
import java.util.UUID;

@Service
public class AvatarStorageService {

    private final StorageProvider storage;

    @Value("${app.media.base-url:/media}")
    private String baseUrl;

    // Thumbnail settings
    @Value("${media.avatar.thumbnail.enabled:true}")
    private boolean thumbEnabled;

    @Value("${media.avatar.thumbnail.width:200}")
    private int thumbWidth;

    @Value("${media.avatar.thumbnail.height:200}")
    private int thumbHeight;

    // Dimension limits (downscale if exceeded)
    @Value("${media.avatar.max-width:2000}")
    private int maxWidth;

    @Value("${media.avatar.max-height:2000}")
    private int maxHeight;

    // Strip metadata by re-encoding for png/jpeg
    @Value("${media.avatar.strip-metadata:true}")
    private boolean stripMetadata;

    private final MediaUrlResolver urlResolver;

    public AvatarStorageService(StorageProvider storage, MediaUrlResolver urlResolver) {
        this.storage = storage;
        this.urlResolver = urlResolver;
    }

    /**
     * Stores the given avatar for the user. Returns the public URL of the original image.
     * Also creates a thumbnail (if enabled) alongside the original with suffix _thumb.
     */
    public String store(String username, MultipartFile file) {
        try {
            String ext = extensionFrom(file);
            String safeUser = sanitize(username);
            String id = Instant.now().toEpochMilli() + "-" + UUID.randomUUID().toString().replace("-", "");
            String relDir = "avatars/" + safeUser + "/";
            String baseName = id + "." + ext;
            String thumbName = id + "_thumb." + ext;

            BufferedImage img = readIfImage(file);
            boolean isPng = "png".equalsIgnoreCase(ext);
            boolean isJpg = "jpg".equalsIgnoreCase(ext) || "jpeg".equalsIgnoreCase(ext);

            if (img != null && (isPng || isJpg)) {
                // Downscale if exceeds limits
                BufferedImage processed = ensureMaxDimensions(img, maxWidth, maxHeight);

                // Re-encode to strip metadata if enabled and write to storage
                ByteArrayOutputStream outOriginal = new ByteArrayOutputStream(64 * 1024);
                if (isJpg) {
                    writeJpeg(processed, outOriginal, 0.9f);
                } else {
                    ImageIO.write(processed, "png", outOriginal);
                }
                try (InputStream in = new ByteArrayInputStream(outOriginal.toByteArray())) {
                    storage.store(relDir + baseName, in);
                }

                if (thumbEnabled) {
                    BufferedImage thumb = scaleToFit(processed, thumbWidth, thumbHeight);
                    ByteArrayOutputStream outThumb = new ByteArrayOutputStream(16 * 1024);
                    if (isJpg) {
                        writeJpeg(thumb, outThumb, 0.85f);
                    } else {
                        ImageIO.write(thumb, "png", outThumb);
                    }
                    try (InputStream in = new ByteArrayInputStream(outThumb.toByteArray())) {
                        storage.store(relDir + thumbName, in);
                    }
                }
            } else {
                // Unknown format (e.g., webp) or could not decode: store as-is, skip thumb
                try (InputStream in = file.getInputStream()) {
                    storage.store(relDir + baseName, in);
                }
            }

            return urlResolver.publicUrlFor(relDir + baseName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store avatar: " + e.getMessage(), e);
        }
    }

    public void delete(String url) {
        try {
            if (url == null || url.isBlank()) return;
            String rel = urlResolver.relativePathFromPublicUrl(url);
            storage.delete(rel);
            // Delete sibling thumbnail if exists
            String thumbRel = rel.replaceFirst("(\\.[^.]+)$", "_thumb$1");
            storage.delete(thumbRel);
        } catch (Exception ignore) {
        }
    }

    // --- helpers ---

    private static String extensionFrom(MultipartFile file) {
        String filename = file.getOriginalFilename();
        String ext = null;
        if (filename != null && filename.contains(".")) {
            ext = filename.substring(filename.lastIndexOf('.') + 1);
        } else if (file.getContentType() != null) {
            String ct = file.getContentType().toLowerCase(Locale.ROOT);
            if (ct.contains("jpeg")) ext = "jpg";
            else if (ct.contains("jpg")) ext = "jpg";
            else if (ct.contains("png")) ext = "png";
            else if (ct.contains("webp")) ext = "webp";
        }
        if (ext == null || ext.isBlank()) return "jpg";
        ext = ext.toLowerCase(Locale.ROOT);
        // normalize
        if ("jpeg".equals(ext)) ext = "jpg";
        return ext;
    }

    private static String sanitize(String s) {
        if (s == null) return "user";
        String t = s.trim().toLowerCase(Locale.ROOT);
        t = t.replaceAll("[^a-z0-9._-]", "_");
        return t.isBlank() ? "user" : t;
    }

    private BufferedImage readIfImage(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            return ImageIO.read(in);
        } catch (Exception e) {
            return null;
        }
    }

    private static BufferedImage ensureMaxDimensions(BufferedImage src, int maxW, int maxH) {
        if (src == null) return null;
        if (src.getWidth() <= maxW && src.getHeight() <= maxH) {
            return src;
        }
        return scaleToFit(src, maxW, maxH);
    }

    private static BufferedImage scaleToFit(BufferedImage src, int maxW, int maxH) {
        double scale = Math.min((double) maxW / src.getWidth(), (double) maxH / src.getHeight());
        int w = Math.max(1, (int) Math.round(src.getWidth() * scale));
        int h = Math.max(1, (int) Math.round(src.getHeight() * scale));
        int type = src.getType() == 0 ? BufferedImage.TYPE_INT_ARGB : src.getType();
        BufferedImage dst = new BufferedImage(w, h, type);
        Graphics2D g = dst.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.drawImage(src, 0, 0, w, h, null);
        } finally {
            g.dispose();
        }
        return dst;
    }

    private static void writeJpeg(BufferedImage src, ByteArrayOutputStream out, float quality) throws Exception {
        // Ensure no alpha for JPEG
        if (src.getType() == BufferedImage.TYPE_INT_ARGB || src.getColorModel().hasAlpha()) {
            BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
            Graphics2D g = rgb.createGraphics();
            try {
                g.setComposite(AlphaComposite.SrcOver);
                g.setColor(Color.WHITE);
                g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
                g.drawImage(src, 0, 0, null);
            } finally {
                g.dispose();
            }
            src = rgb;
        }

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            ImageIO.write(src, "jpg", out);
            return;
        }
        ImageWriter writer = writers.next();
        javax.imageio.stream.MemoryCacheImageOutputStream mOut = new javax.imageio.stream.MemoryCacheImageOutputStream(out);
        try {
            writer.setOutput(mOut);
            ImageWriteParam param = writer.getDefaultWriteParam();
            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(quality);
            }
            writer.write(null, new IIOImage(src, null, null), param);
        } finally {
            writer.dispose();
            mOut.close();
        }
    }

    private String joinUrl(String base, String rel) {
        String b = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        String r = rel.startsWith("/") ? rel : "/" + rel;
        return b + r;
    }

    private String relativeFromUrl(String url) {
        String b = baseUrl;
        if (b.endsWith("/")) b = b.substring(0, b.length() - 1);
        String u = url;
        int idx = u.indexOf(b);
        if (idx >= 0) {
            return u.substring(idx + b.length()).replaceFirst("^/", "");
        }
        // best-effort fallback: assume it's already relative
        return url.replaceFirst("^/", "");
    }
}
