package com.iciitp.api.features.program.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.iciitp.api.shared.JsonMapConverter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "programs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    public enum Section {
        PRE_INCUBATION, INCUBATION, ACCELERATION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean published;

    @Column(nullable = false)
    @Builder.Default
    private boolean system = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Section section;

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> extras = new HashMap<>();

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
