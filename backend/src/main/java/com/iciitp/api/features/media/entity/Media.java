package com.iciitp.api.features.media.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "media")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String originalName;

    private String mimeType;
    private Long sizeBytes;
    private String diskPath;
    private String url;
    private String uploadedBy;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
