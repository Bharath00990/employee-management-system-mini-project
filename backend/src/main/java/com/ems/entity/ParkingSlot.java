package com.ems.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parking_slots",
       indexes = {
           @Index(name = "idx_slot_status", columnList = "status")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String slotNumber; // e.g. "P01", "P02", etc.

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String floor = "Ground Floor";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE
}
