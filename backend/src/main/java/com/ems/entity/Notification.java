package com.ems.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications",
       indexes = {
           @Index(name = "idx_notif_user", columnList = "user_id"),
           @Index(name = "idx_notif_is_read", columnList = "isRead")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "employee", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String type = "INFO"; // INFO, SUCCESS, WARNING, DANGER

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(length = 150)
    private String link; // Optional direct navigation link

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
