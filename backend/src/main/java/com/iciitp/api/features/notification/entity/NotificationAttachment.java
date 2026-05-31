package com.iciitp.api.features.notification.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Notification notification;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String url;

    private String type;
}
