package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.entity.Attendance;
import com.ems.entity.Employee;
import com.ems.exception.BadRequestException;
import com.ems.exception.ConflictException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.security.UserDetailsImpl;
import com.ems.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    @Data
    public static class MarkAttendanceRequest {
        private Long employeeId;
        private String status;
        private String remarks;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        List<Attendance> list = attendanceRepository.findByDate(queryDate);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Attendance>>> getMyAttendance(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Current user has no associated employee profile"));

        List<Attendance> list = attendanceRepository.findByEmployeeIdOrderByDateDesc(emp.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/employee/{empId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getEmployeeAttendance(@PathVariable Long empId) {
        List<Attendance> list = attendanceRepository.findByEmployeeIdOrderByDateDesc(empId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<Attendance>> markAttendance(
            @RequestBody(required = false) MarkAttendanceRequest req,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            HttpServletRequest httpServletRequest) {

        Long empId = (req != null) ? req.getEmployeeId() : null;

        if (empId == null) {
            Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                    .orElseThrow(() -> new BadRequestException(
                            "Current user has no associated employee profile"));
            empId = emp.getId();
        }

        final Long employeeId = empId;

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with id: " + employeeId));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        Attendance attendance;

        if (existing.isPresent()) {
            attendance = existing.get();

            // If already clocked in, clock out
            if (attendance.getCheckOut() == null) {
                attendance.setCheckOut(LocalTime.now());

                if (req != null && req.getRemarks() != null) {
                    attendance.setRemarks(req.getRemarks());
                }
            } else {
                throw new ConflictException("Attendance already completed for today.");
            }

        } else {
            LocalTime now = LocalTime.now();

            String status = (req != null && req.getStatus() != null)
                    ? req.getStatus()
                    : (now.isAfter(LocalTime.of(9, 30)) ? "LATE" : "PRESENT");

            attendance = Attendance.builder()
                    .employee(employee)
                    .date(today)
                    .checkIn(now)
                    .status(status)
                    .remarks((req != null && req.getRemarks() != null)
                            ? req.getRemarks()
                            : "Web portal check-in")
                    .build();
        }

        Attendance saved = attendanceRepository.save(attendance);

        if (httpServletRequest != null && httpServletRequest.getUserPrincipal() != null) {
            auditLogService.log("ATTENDANCE_RECORDED", httpServletRequest.getUserPrincipal().getName(), "USER",
                    "Attendance", saved.getId(), "Attendance action recorded for " + employee.getFirstName() + " " + employee.getLastName(),
                    httpServletRequest.getRemoteAddr());
        }

        return ResponseEntity.ok(
                ApiResponse.success("Attendance marked successfully", saved));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceStats() {
        LocalDate today = LocalDate.now();
        long presentToday = attendanceRepository.countByDateAndStatus(today, "PRESENT");
        long lateToday = attendanceRepository.countByDateAndStatus(today, "LATE");
        long totalEmployees = employeeRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("date", today);
        stats.put("presentCount", presentToday);
        stats.put("lateCount", lateToday);
        stats.put("totalEmployees", totalEmployees);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}