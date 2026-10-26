package com.ems.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs",
       indexes = {
           @Index(name = "idx_audit_action", columnList = "action"),
           @Index(name = "idx_audit_user", columnList = "username"),
           @Index(name = "idx_audit_created", columnList = "createdAt")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String action; // LOGIN, EMPLOYEE_CREATED, LEAVE_APPROVED, etc.

    @Column(nullable = false, length = 50)
    private String username;

    @Column(length = 50)
    private String userRole;

    @Column(length = 50)
    private String entityName; // e.g. "Employee", "LeaveRequest"

    private Long entityId;

    @Column(length = 1000)
    private String details;

    @Column(length = 50)
    private String ipAddress;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
