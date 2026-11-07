package com.ems.controller;

import com.ems.dto.response.ParkingAllocationResponse;
import com.ems.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/employee/parking")
public class EmployeeParkingController {

    private final ParkingService parkingService;

    public EmployeeParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @GetMapping
    public ResponseEntity<List<ParkingAllocationResponse>> getMyAllocations(Principal principal) {
        return ResponseEntity.ok(parkingService.getMyAllocations(principal.getName()));
    }
}
