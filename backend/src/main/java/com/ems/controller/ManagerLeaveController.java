package com.ems.controller;

import com.ems.dto.request.RejectLeaveRequest;
import com.ems.dto.response.LeaveResponse;
import com.ems.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/manager/leaves")
public class ManagerLeaveController {

    private final LeaveService leaveService;

    public ManagerLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getLeaves(Principal principal) {
        return ResponseEntity.ok(leaveService.getManagerLeaves(principal.getName()));
    }

    @GetMapping("/{leaveId}")
    public ResponseEntity<LeaveResponse> getLeave(@PathVariable Long leaveId, Principal principal) {
        return ResponseEntity.ok(leaveService.getManagerLeave(principal.getName(), leaveId));
    }

    @PatchMapping("/{leaveId}/approve")
    public ResponseEntity<LeaveResponse> approveLeave(@PathVariable Long leaveId, Principal principal) {
        return ResponseEntity.ok(leaveService.approveManagerLeave(principal.getName(), leaveId));
    }

    @PatchMapping("/{leaveId}/reject")
    public ResponseEntity<LeaveResponse> rejectLeave(@PathVariable Long leaveId, @RequestBody(required = false) RejectLeaveRequest request, Principal principal) {
        return ResponseEntity.ok(leaveService.rejectManagerLeave(principal.getName(), leaveId, request));
    }
}
