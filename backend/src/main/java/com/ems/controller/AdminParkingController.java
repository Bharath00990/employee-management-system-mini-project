package com.ems.controller;

import com.ems.dto.request.CreateParkingAllocationRequest;
import com.ems.dto.request.CreateParkingSlotRequest;
import com.ems.dto.response.ParkingAllocationResponse;
import com.ems.dto.response.ParkingSlotResponse;
import com.ems.service.ParkingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/parking")
public class AdminParkingController {

    private final ParkingService parkingService;

    public AdminParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping("/slots")
    public ResponseEntity<ParkingSlotResponse> createSlot(@Valid @RequestBody CreateParkingSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parkingService.createSlot(request));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<ParkingSlotResponse>> getAllSlots() {
        return ResponseEntity.ok(parkingService.getAllSlots());
    }

    @GetMapping("/slots/{slotId}")
    public ResponseEntity<ParkingSlotResponse> getSlot(@PathVariable Long slotId) {
        return ResponseEntity.ok(parkingService.getSlot(slotId));
    }

    @PostMapping("/allocations")
    public ResponseEntity<ParkingAllocationResponse> allocateSlot(@Valid @RequestBody CreateParkingAllocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parkingService.allocateSlot(request));
    }

    @GetMapping("/allocations")
    public ResponseEntity<List<ParkingAllocationResponse>> getAllAllocations() {
        return ResponseEntity.ok(parkingService.getAllAllocations());
    }

    @GetMapping("/allocations/{allocationId}")
    public ResponseEntity<ParkingAllocationResponse> getAllocation(@PathVariable Long allocationId) {
        return ResponseEntity.ok(parkingService.getAllocation(allocationId));
    }

    @PatchMapping("/allocations/{allocationId}/release")
    public ResponseEntity<ParkingAllocationResponse> releaseAllocation(@PathVariable Long allocationId) {
        return ResponseEntity.ok(parkingService.releaseAllocation(allocationId));
    }
}
