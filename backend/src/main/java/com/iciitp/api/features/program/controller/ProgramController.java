package com.iciitp.api.features.program.controller;

import com.iciitp.api.features.program.entity.Program;
import com.iciitp.api.features.program.service.ProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService service;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestParam(required = false) String section) {
        if (section != null) {
            Program.Section s;
            try { s = Program.Section.valueOf(section); }
            catch (IllegalArgumentException e) { return ResponseEntity.badRequest().build(); }
            return ResponseEntity.ok(service.findPublishedBySection(s));
        }
        return ResponseEntity.ok(service.findPublished());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> listAll(
        @PageableDefault(size = 50) Pageable pageable
    ) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String slug) {
        return ResponseEntity.ok(service.findBySlug(slug));
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> upsert(@PathVariable String slug,
            @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(service.upsert(slug, data));
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        service.delete(slug);
        return ResponseEntity.noContent().build();
    }
}
