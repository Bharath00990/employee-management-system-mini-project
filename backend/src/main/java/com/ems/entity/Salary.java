package com.ems.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "salaries",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_emp_month_year", columnNames = {"employee_id", "month", "year"})
       },
       indexes = {
           @Index(name = "idx_salary_period", columnList = "month, year")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"user", "hibernateLazyInitializer", "handler"})
    private Employee employee;

    @Column(nullable = false, length = 20)
    private String month; // e.g. "January"

    @Column(nullable = false)
    private Integer year; // e.g. 2026

    @Column(nullable = false)
    private Double basicPay;

    @Column(nullable = false)
    @Builder.Default
    private Double allowances = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double deductions = 0.0;

    @Column(nullable = false)
    private Double netPay; // Formula: basicPay + allowances - deductions

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String paymentStatus = "PAID"; // PAID, PENDING, PROCESSING

    @Column(length = 255)
    private String remarks;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void calculateNetPay() {
        double b = (basicPay != null) ? basicPay : 0.0;
        double a = (allowances != null) ? allowances : 0.0;
        double d = (deductions != null) ? deductions : 0.0;
        this.netPay = b + a - d;
    }
}
