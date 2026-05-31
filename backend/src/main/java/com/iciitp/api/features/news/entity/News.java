package com.iciitp.api.features.news.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String coverImageUrl;

    @Column(columnDefinition = "TEXT")
    private String imagesJson;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'grid'")
    private String imageLayout;

    private String category;

    @Column(nullable = false)
    private boolean published;

    @Column(columnDefinition = "boolean NOT NULL DEFAULT false")
    private boolean featured;

    private LocalDateTime publishedAt;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
