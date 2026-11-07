package com.ems.controller;

import com.ems.dto.request.UpdateAttendanceStatusRequest;
import com.ems.dto.response.AttendanceResponse;
import com.ems.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/attendance")
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    public AdminAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
        }
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeAttendance(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(attendanceService.getEmployeeAttendanceByDate(employeeId, date));
        }
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId));
    }

    @PatchMapping("/{attendanceId}/status")
    public ResponseEntity<AttendanceResponse> updateAttendanceStatus(
            @PathVariable Long attendanceId,
            @Valid @RequestBody UpdateAttendanceStatusRequest request) {
        return ResponseEntity.ok(attendanceService.updateAttendanceStatus(attendanceId, request));
    }
}
