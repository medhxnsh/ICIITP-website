package com.iciitp.api.features.media.service;

import com.iciitp.api.features.media.entity.Media;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import com.iciitp.api.features.media.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository repo;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // ── Allowed types: extension → verified MIME type ────────────────────────────
    private static final Map<String, String> ALLOWED = Map.of(
        "jpg",  "image/jpeg",
        "jpeg", "image/jpeg",
        "png",  "image/png",
        "gif",  "image/gif",
        "webp", "image/webp",
        "pdf",  "application/pdf",
        "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // ── Magic byte signatures keyed by MIME type ─────────────────────────────────
    private static final Map<String, byte[]> MAGIC = Map.of(
        "image/jpeg",       new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF},
        "image/png",        new byte[]{(byte)0x89, 0x50, 0x4E, 0x47},
        "image/gif",        new byte[]{0x47, 0x49, 0x46, 0x38},
        "image/webp",       new byte[]{0x52, 0x49, 0x46, 0x46}, // RIFF header
        "application/pdf",  new byte[]{0x25, 0x50, 0x44, 0x46}, // %PDF
        // XLSX is a ZIP file: both share PK\x03\x04 magic bytes
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            new byte[]{0x50, 0x4B, 0x03, 0x04}
    );

    public Page<Media> findAll(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Media upload(MultipartFile file, String uploadedBy) throws IOException {
        String original = file.getOriginalFilename() != null
            ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
            : "file";

        // 1 — Extension whitelist check
        String ext = extension(original).toLowerCase();
        String expectedMime = ALLOWED.get(ext);
        if (expectedMime == null) {
            throw new IllegalArgumentException(
                "File type not allowed. Permitted extensions: " + String.join(", ", ALLOWED.keySet()));
        }

        // 2 — Magic byte check: read actual file content, not the client-supplied header
        validateMagicBytes(file, expectedMime);

        String filename = System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6)
            + "-" + original;

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        Path dest = uploadPath.resolve(filename);

        // 3 — Resolve against uploadPath to block path traversal (e.g. ../../etc/passwd)
        if (!dest.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Invalid filename");
        }

        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        Media media = Media.builder()
            .filename(filename)
            .originalName(original)
            .mimeType(expectedMime)          // use verified MIME, not client-supplied header
            .sizeBytes(file.getSize())
            .diskPath(dest.toString())
            .url("/uploads/" + filename)
            .uploadedBy(uploadedBy)
            .build();

        return repo.save(media);
    }

    public void delete(String id) throws IOException {
        Media media = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Media not found: " + id));

        Path path = Paths.get(media.getDiskPath());
        Files.deleteIfExists(path);
        repo.deleteById(id);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private static String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 && dot < filename.length() - 1 ? filename.substring(dot + 1) : "";
    }

    private static void validateMagicBytes(MultipartFile file, String expectedMime) throws IOException {
        byte[] signature = MAGIC.get(expectedMime);
        if (signature == null) return; // no magic defined for this type — extension check is enough

        byte[] header = new byte[signature.length];
        try (InputStream in = file.getInputStream()) {
            int read = in.read(header, 0, header.length);
            if (read < header.length) {
                throw new IllegalArgumentException("File is too small or corrupted");
            }
        }

        for (int i = 0; i < signature.length; i++) {
            if (header[i] != signature[i]) {
                throw new IllegalArgumentException(
                    "File content does not match the declared extension. Upload rejected.");
            }
        }
    }
}
