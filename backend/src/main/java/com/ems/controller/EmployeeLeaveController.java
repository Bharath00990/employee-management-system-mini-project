package com.ems.controller;

import com.ems.dto.request.CreateLeaveRequest;
import com.ems.dto.response.LeaveResponse;
import com.ems.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/employee/leaves")
public class EmployeeLeaveController {

    private final LeaveService leaveService;

    public EmployeeLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody CreateLeaveRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.applyLeave(principal.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(Principal principal) {
        return ResponseEntity.ok(leaveService.getMyLeaves(principal.getName()));
    }

    @GetMapping("/{leaveId}")
    public ResponseEntity<LeaveResponse> getMyLeave(@PathVariable Long leaveId, Principal principal) {
        return ResponseEntity.ok(leaveService.getMyLeave(principal.getName(), leaveId));
    }

    @PatchMapping("/{leaveId}/cancel")
    public ResponseEntity<LeaveResponse> cancelLeave(@PathVariable Long leaveId, Principal principal) {
        return ResponseEntity.ok(leaveService.cancelLeave(principal.getName(), leaveId));
    }
}
