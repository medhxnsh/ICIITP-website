package com.iciitp.api.features.lab.service;

import com.iciitp.api.features.lab.entity.Lab;
import com.iciitp.api.features.lab.repository.LabRepository;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LabService {

    private final LabRepository repo;

    public List<Map<String, Object>> findAll() {
        return repo.findAllByOrderBySlugAsc().stream().map(this::toMap).toList();
    }

    public Map<String, Object> findBySlug(String slug) {
        return repo.findBySlug(slug)
                .map(this::toMap)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found: " + slug));
    }

    /** Admin: update only the display fields — slug is immutable, equipment stays in code. */
    public Map<String, Object> update(String slug, Map<String, Object> data) {
        Lab lab = repo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Lab not found: " + slug));
        if (data.containsKey("title") && data.get("title") != null)
            lab.setTitle(data.get("title").toString().trim());
        if (data.containsKey("tagline"))
            lab.setTagline(data.get("tagline") == null ? null : data.get("tagline").toString().trim());
        if (data.containsKey("description"))
            lab.setDescription(data.get("description") == null ? null : data.get("description").toString().trim());
        return toMap(repo.save(lab));
    }

    private Map<String, Object> toMap(Lab l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("slug", l.getSlug());
        m.put("title", l.getTitle());
        m.put("tagline", l.getTagline());
        m.put("description", l.getDescription());
        m.put("updatedAt", l.getUpdatedAt());
        return m;
    }
}
