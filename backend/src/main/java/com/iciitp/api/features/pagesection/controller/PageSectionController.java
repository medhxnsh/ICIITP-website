package com.iciitp.api.features.pagesection.controller;

import com.iciitp.api.features.pagesection.entity.PageSection;
import com.iciitp.api.features.pagesection.repository.PageSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/pages")
@RequiredArgsConstructor
public class PageSectionController {

    private final PageSectionRepository repo;

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String slug) {
        return repo.findById(slug)
            .map(s -> ResponseEntity.ok(s.getData()))
            .orElse(ResponseEntity.ok(Map.of()));
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> upsert(
        @PathVariable String slug,
        @RequestBody Map<String, Object> data
    ) {
        PageSection section = repo.findById(slug)
            .orElse(PageSection.builder().pageSlug(slug).build());
        section.setData(data);
        repo.save(section);
        return ResponseEntity.ok(data);
    }
}
