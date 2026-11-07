package com.ems.controller;

import com.ems.dto.response.LeaveResponse;
import com.ems.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/leaves")
public class AdminLeaveController {

    private final LeaveService leaveService;

    public AdminLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveResponse>> getEmployeeLeaves(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaves(employeeId));
    }

    @GetMapping("/{leaveId}")
    public ResponseEntity<LeaveResponse> getLeave(@PathVariable Long leaveId) {
        return ResponseEntity.ok(leaveService.getLeave(leaveId));
    }

    @PatchMapping("/{leaveId}/approve")
    public ResponseEntity<LeaveResponse> approveLeave(@PathVariable Long leaveId) {
        return ResponseEntity.ok(leaveService.approveAdminLeave(leaveId));
    }

    @PatchMapping("/{leaveId}/reject")
    public ResponseEntity<LeaveResponse> rejectLeave(@PathVariable Long leaveId) {
        return ResponseEntity.ok(leaveService.rejectAdminLeave(leaveId));
    }
}
