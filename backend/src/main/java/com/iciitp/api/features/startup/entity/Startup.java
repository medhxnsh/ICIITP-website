package com.iciitp.api.features.startup.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "startups")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Startup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String scheme;

    @Column(columnDefinition = "TEXT")
    private String tagline;

    // Stored as JSON array string: ["AI/ML","SaaS"]
    @Column(name = "sectors", columnDefinition = "TEXT")
    private String sectorsJson;

    // Stored as JSON array string: ["Founder Name"]
    @Column(name = "founders", columnDefinition = "TEXT")
    private String foundersJson;

    private String website;

    private String logoUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;

    @Builder.Default
    private int sortOrder = 0;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
