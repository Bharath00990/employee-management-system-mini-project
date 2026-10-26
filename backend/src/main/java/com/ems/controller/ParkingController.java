package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.entity.Employee;
import com.ems.entity.ParkingAllocation;
import com.ems.entity.ParkingSlot;
import com.ems.exception.BadRequestException;
import com.ems.exception.ConflictException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ParkingAllocationRepository;
import com.ems.repository.ParkingSlotRepository;
import com.ems.security.UserDetailsImpl;
import com.ems.service.AuditLogService;
import com.ems.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
public class ParkingController {

    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingAllocationRepository parkingAllocationRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Data
    public static class RequestSlotDto {
        private Long slotId;
        private String vehicleNumber;
        private String vehicleType;
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<ParkingSlot>>> getAllSlots() {
        return ResponseEntity.ok(ApiResponse.success(parkingSlotRepository.findAll()));
    }

    @GetMapping("/allocations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ParkingAllocation>>> getAllAllocations() {
        return ResponseEntity.ok(ApiResponse.success(parkingAllocationRepository.findAll()));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ParkingAllocation>>> getMyAllocations(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Current user has no associated employee profile"));
        return ResponseEntity.ok(ApiResponse.success(parkingAllocationRepository.findByEmployeeIdOrderByCreatedAtDesc(emp.getId())));
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<ParkingAllocation>> requestParking(
            @RequestBody RequestSlotDto req,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal) {

        Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Current user has no associated employee profile"));

        ParkingSlot slot = parkingSlotRepository.findById(req.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + req.getSlotId()));

        if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {
            throw new ConflictException("Slot " + slot.getSlotNumber() + " is already " + slot.getStatus());
        }

        // Check if employee already has an active allocation
        Optional<ParkingAllocation> active = parkingAllocationRepository.findByEmployeeIdAndStatus(emp.getId(), "ALLOCATED");
        if (active.isPresent()) {
            throw new ConflictException("Employee already has an allocated parking slot: " + active.get().getSlot().getSlotNumber());
        }

        slot.setStatus("RESERVED");
        parkingSlotRepository.save(slot);

        ParkingAllocation allocation = ParkingAllocation.builder()
                .slot(slot)
                .employee(emp)
                .vehicleNumber(req.getVehicleNumber())
                .vehicleType(req.getVehicleType() != null ? req.getVehicleType() : "4-Wheeler (Car)")
                .requestDate(LocalDate.now())
                .status("PENDING")
                .build();

        ParkingAllocation saved = parkingAllocationRepository.save(allocation);
        return ResponseEntity.ok(ApiResponse.success("Parking requested successfully", saved));
    }

    @PatchMapping("/allocations/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingAllocation>> approveAllocation(
            @PathVariable Long id,
            HttpServletRequest request) {

        ParkingAllocation allocation = parkingAllocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation request not found with id: " + id));

        allocation.setStatus("ALLOCATED");
        allocation.setAllocatedDate(LocalDate.now());

        ParkingSlot slot = allocation.getSlot();
        slot.setStatus("OCCUPIED");
        parkingSlotRepository.save(slot);

        ParkingAllocation saved = parkingAllocationRepository.save(allocation);

        // Notify employee
        if (allocation.getEmployee().getUser() != null) {
            notificationService.createNotification(
                    allocation.getEmployee().getUser(),
                    "Parking Slot Allocated",
                    "Slot " + slot.getSlotNumber() + " has been officially allocated to vehicle " + allocation.getVehicleNumber(),
                    "SUCCESS",
                    "/employee/parking"
            );
        }

        auditLogService.log("PARKING_ALLOCATED", request.getUserPrincipal().getName(), "ADMIN", "ParkingSlot", slot.getId(), "Allocated slot " + slot.getSlotNumber() + " to " + allocation.getEmployee().getFirstName(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Parking slot approved and allocated", saved));
    }

    @PatchMapping("/allocations/{id}/release")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingAllocation>> releaseAllocation(
            @PathVariable Long id,
            HttpServletRequest request) {

        ParkingAllocation allocation = parkingAllocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation request not found with id: " + id));

        allocation.setStatus("RELEASED");
        ParkingSlot slot = allocation.getSlot();
        slot.setStatus("AVAILABLE");
        parkingSlotRepository.save(slot);

        ParkingAllocation saved = parkingAllocationRepository.save(allocation);
        auditLogService.log("PARKING_RELEASED", request.getUserPrincipal().getName(), "ADMIN", "ParkingSlot", slot.getId(), "Released slot " + slot.getSlotNumber(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Slot released and available", saved));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getParkingStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSlots", parkingSlotRepository.count());
        stats.put("availableSlots", parkingSlotRepository.countByStatus("AVAILABLE"));
        stats.put("occupiedSlots", parkingSlotRepository.countByStatus("OCCUPIED"));
        stats.put("reservedSlots", parkingSlotRepository.countByStatus("RESERVED"));
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
