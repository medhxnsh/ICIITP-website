package com.iciitp.api.features.program.service;

import com.iciitp.api.features.program.entity.Program;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import com.iciitp.api.features.program.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository repo;

    public Page<Map<String, Object>> findAll(Pageable pageable) {
        return repo.findAllByOrderByUpdatedAtDesc(pageable).map(this::toMap);
    }

    public List<Map<String, Object>> findPublished() {
        return repo.findByPublishedTrueOrderByUpdatedAtDesc().stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> findPublishedBySection(Program.Section section) {
        return repo.findByPublishedTrueAndSectionOrderByUpdatedAtDesc(section).stream().map(this::toMap).toList();
    }

    public Map<String, Object> findBySlug(String slug) {
        Program p = repo.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + slug));
        return toMap(p);
    }

    @Transactional
    public Map<String, Object> upsert(String slug, Map<String, Object> data) {
        Program p = repo.findBySlug(slug).orElse(new Program());
        p.setSlug(slug);
        p.setTitle(data.getOrDefault("title", slug) instanceof String s ? s : slug);
        p.setTagline(data.get("tagline") instanceof String s ? s : null);

        // Accept both "about" and "description" as the long-form text; prefer "about"
        String about = data.get("about") instanceof String s ? s : null;
        String desc = data.get("description") instanceof String s ? s : null;
        p.setDescription(about != null ? about : desc);

        p.setPublished(Boolean.TRUE.equals(data.get("published")));

        String sectionStr = data.get("section") instanceof String s ? s : null;
        if (sectionStr != null) {
            try { p.setSection(Program.Section.valueOf(sectionStr)); }
            catch (IllegalArgumentException ignored) { p.setSection(null); }
        } else {
            p.setSection(null);
        }

        Map<String, Object> extras = new HashMap<>(data);
        for (String key : List.of("id", "slug", "title", "tagline", "about", "description",
                "published", "system", "section", "updatedAt")) {
            extras.remove(key);
        }
        p.setExtras(extras);

        return toMap(repo.save(p));
    }

    @Transactional
    public void delete(String slug) {
        Program p = repo.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + slug));
        if (p.isSystem()) {
            throw new IllegalStateException("Cannot delete a system programme. Edit it instead.");
        }
        repo.deleteById(p.getId());
    }

    private Map<String, Object> toMap(Program p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("slug", p.getSlug());
        m.put("title", p.getTitle());
        m.put("tagline", p.getTagline());
        m.put("about", p.getDescription());
        m.put("section", p.getSection() != null ? p.getSection().name() : null);
        m.put("published", p.isPublished());
        m.put("system", p.isSystem());
        m.put("updatedAt", p.getUpdatedAt());
        if (p.getExtras() != null) m.putAll(p.getExtras());
        return m;
    }
}
