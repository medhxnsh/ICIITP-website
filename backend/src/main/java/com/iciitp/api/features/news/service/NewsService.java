package com.iciitp.api.features.news.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iciitp.api.features.news.entity.News;
import com.iciitp.api.features.news.repository.NewsRepository;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository repo;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public Page<Map<String, Object>> findAllAdmin(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable).map(this::toMap);
    }

    public List<Map<String, Object>> findAllPublished() {
        return repo.findByPublishedTrueOrderByPublishedAtDesc().stream().map(this::toMap).toList();
    }

    public Map<String, Object> findById(String id) {
        return repo.findById(id).map(this::toMap)
                .orElseThrow(() -> new ResourceNotFoundException("News not found: " + id));
    }

    public Map<String, Object> findBySlug(String slug) {
        return repo.findBySlug(slug).map(this::toMap)
                .orElseThrow(() -> new ResourceNotFoundException("News not found: " + slug));
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> data) {
        News news = fromData(new News(), data);
        if (repo.existsBySlug(news.getSlug())) {
            throw new IllegalArgumentException("Slug already in use: " + news.getSlug());
        }
        News saved = repo.save(news);
        if (saved.isFeatured()) repo.clearFeaturedExcept(saved.getId());
        return toMap(saved);
    }

    @Transactional
    public Map<String, Object> update(String id, Map<String, Object> data) {
        News news = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found: " + id));
        String newSlug = (String) data.get("slug");
        if (newSlug != null && repo.existsBySlugAndIdNot(newSlug, id)) {
            throw new IllegalArgumentException("Slug already in use: " + newSlug);
        }
        fromData(news, data);
        News saved = repo.save(news);
        if (saved.isFeatured()) repo.clearFeaturedExcept(saved.getId());
        return toMap(saved);
    }

    public void delete(String id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("News not found: " + id);
        repo.deleteById(id);
    }

    private News fromData(News n, Map<String, Object> d) {
        if (d.containsKey("slug"))         n.setSlug((String) d.get("slug"));
        if (d.containsKey("title"))        n.setTitle((String) d.get("title"));
        if (d.containsKey("tagline"))      n.setTagline((String) d.get("tagline"));
        if (d.containsKey("body"))         n.setBody((String) d.get("body"));
        if (d.containsKey("coverImageUrl")) n.setCoverImageUrl((String) d.get("coverImageUrl"));
        if (d.containsKey("category"))     n.setCategory((String) d.get("category"));

        if (d.containsKey("images")) {
            try { n.setImagesJson(MAPPER.writeValueAsString(d.get("images"))); }
            catch (JsonProcessingException ignored) {}
        }
        if (d.containsKey("imageLayout"))  n.setImageLayout((String) d.get("imageLayout"));

        if (d.containsKey("featured")) {
            n.setFeatured(Boolean.TRUE.equals(d.get("featured")));
        }

        if (d.containsKey("published")) {
            boolean pub = Boolean.TRUE.equals(d.get("published"));
            // Auto-set only when first publishing and no explicit date will come later
            boolean hasExplicitDate = d.containsKey("publishedAt")
                    && d.get("publishedAt") != null
                    && !d.get("publishedAt").toString().isBlank();
            if (pub && n.getPublishedAt() == null && !hasExplicitDate) {
                n.setPublishedAt(LocalDateTime.now());
            }
            n.setPublished(pub);
        }

        // Admin-supplied date always wins — processed AFTER published block so it cannot be overridden
        if (d.containsKey("publishedAt") && d.get("publishedAt") != null
                && !d.get("publishedAt").toString().isBlank()) {
            try {
                String raw = d.get("publishedAt").toString().trim();
                if (raw.length() == 10) {
                    n.setPublishedAt(LocalDate.parse(raw).atStartOfDay());
                } else {
                    n.setPublishedAt(LocalDateTime.parse(raw.substring(0, 19)));
                }
            } catch (Exception ignored) {}
        }
        return n;
    }

    private Map<String, Object> toMap(News n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("slug", n.getSlug());
        m.put("title", n.getTitle());
        m.put("tagline", n.getTagline());
        m.put("body", n.getBody());
        m.put("coverImageUrl", n.getCoverImageUrl());
        m.put("imageLayout", n.getImageLayout() != null ? n.getImageLayout() : "grid");
        m.put("category", n.getCategory());
        m.put("published", n.isPublished());
        m.put("featured", n.isFeatured());
        m.put("publishedAt", n.getPublishedAt());
        m.put("createdAt", n.getCreatedAt());
        m.put("updatedAt", n.getUpdatedAt());

        List<?> images = Collections.emptyList();
        if (n.getImagesJson() != null && !n.getImagesJson().isBlank()) {
            try { images = MAPPER.readValue(n.getImagesJson(), new TypeReference<List<?>>() {}); }
            catch (JsonProcessingException ignored) {}
        }
        m.put("images", images);
        return m;
    }
}
