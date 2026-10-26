package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.entity.User;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.repository.UserRepository;
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

import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Data
    public static class LeaveApplyRequest {
        private String leaveType;
        private java.time.LocalDate startDate;
        private java.time.LocalDate endDate;
        private String reason;
    }

    @Data
    public static class ReviewLeaveRequest {
        private String comment;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequest>> applyLeave(
            @RequestBody LeaveApplyRequest req,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal) {

        Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Current user has no associated employee profile"));

        if (req.getStartDate() == null || req.getEndDate() == null) {
            throw new BadRequestException("Start and End dates are required");
        }
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new BadRequestException("End date cannot be earlier than start date");
        }

        int days = (int) ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;

        LeaveRequest leave = LeaveRequest.builder()
                .employee(emp)
                .leaveType(req.getLeaveType() != null ? req.getLeaveType() : "CASUAL")
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .totalDays(days)
                .reason(req.getReason())
                .status("PENDING")
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leave);
        return ResponseEntity.ok(ApiResponse.success("Leave application submitted successfully", saved));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getMyLeaves(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Current user has no associated employee profile"));

        List<LeaveRequest> list = leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(emp.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getAllLeaves(
            @RequestParam(required = false) String status) {
        String st = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;
        List<LeaveRequest> list = leaveRequestRepository.filterLeaves(st);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequest>> approveLeave(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewLeaveRequest req,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            HttpServletRequest httpServletRequest) {

        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        User reviewer = userRepository.findById(userPrincipal.getId()).orElse(null);
        leave.setStatus("APPROVED");
        leave.setReviewedBy(reviewer);
        if (req != null && req.getComment() != null) {
            leave.setReviewComment(req.getComment());
        }

        LeaveRequest updated = leaveRequestRepository.save(leave);

        // Send Notification to Employee
        if (leave.getEmployee().getUser() != null) {
            notificationService.createNotification(
                    leave.getEmployee().getUser(),
                    "Leave Request Approved",
                    "Your " + leave.getLeaveType() + " leave request for " + leave.getStartDate() + " to " + leave.getEndDate() + " has been approved.",
                    "SUCCESS",
                    "/employee/leave"
            );
        }

        auditLogService.log("LEAVE_APPROVED", userPrincipal.getUsername(), "MANAGER", "LeaveRequest", id, "Approved leave for " + leave.getEmployee().getFirstName(), httpServletRequest.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Leave approved successfully", updated));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequest>> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewLeaveRequest req,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            HttpServletRequest httpServletRequest) {

        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        User reviewer = userRepository.findById(userPrincipal.getId()).orElse(null);
        leave.setStatus("REJECTED");
        leave.setReviewedBy(reviewer);
        if (req != null && req.getComment() != null) {
            leave.setReviewComment(req.getComment());
        }

        LeaveRequest updated = leaveRequestRepository.save(leave);

        // Send Notification to Employee
        if (leave.getEmployee().getUser() != null) {
            notificationService.createNotification(
                    leave.getEmployee().getUser(),
                    "Leave Request Rejected",
                    "Your " + leave.getLeaveType() + " leave request has been rejected. Reason: " + (req != null ? req.getComment() : "Not specified"),
                    "DANGER",
                    "/employee/leave"
            );
        }

        auditLogService.log("LEAVE_REJECTED", userPrincipal.getUsername(), "MANAGER", "LeaveRequest", id, "Rejected leave for " + leave.getEmployee().getFirstName(), httpServletRequest.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Leave rejected", updated));
    }
}

