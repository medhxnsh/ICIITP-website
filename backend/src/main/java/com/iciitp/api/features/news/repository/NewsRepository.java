package com.iciitp.api.features.news.repository;

import com.iciitp.api.features.news.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, String> {
    Page<News> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<News> findByPublishedTrueOrderByPublishedAtDesc();
    Optional<News> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, String id);

    @Modifying
    @Query("UPDATE News n SET n.featured = false WHERE n.id <> :excludeId")
    void clearFeaturedExcept(@Param("excludeId") String excludeId);
}
