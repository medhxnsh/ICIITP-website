package com.iciitp.api.features.media.controller;

import com.iciitp.api.features.media.entity.Media;
import com.iciitp.api.features.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService service;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> upload(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetails user
    ) throws IOException {
        Media media = service.upload(file, user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", media.getUrl(), "id", media.getId()));
    }

    @GetMapping("/media")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Media>> list(
        @PageableDefault(size = 50) Pageable pageable
    ) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @DeleteMapping("/media/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) throws IOException {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
