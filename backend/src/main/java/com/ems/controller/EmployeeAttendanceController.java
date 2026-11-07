package com.ems.controller;

import com.ems.dto.request.CreateAttendanceRequest;
import com.ems.dto.response.AttendanceResponse;
import com.ems.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employee/attendance")
public class EmployeeAttendanceController {

    private final AttendanceService attendanceService;

    public EmployeeAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<AttendanceResponse> markAttendance(@Valid @RequestBody CreateAttendanceRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceService.markAttendance(principal.getName(), request));
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponse> checkIn(
            @RequestParam(required = false, defaultValue = "OFFICE") com.ems.entity.WorkMode workMode,
            Principal principal) {
        return ResponseEntity.ok(attendanceService.checkIn(principal.getName(), workMode));
    }

    @PutMapping("/today/work-mode")
    public ResponseEntity<AttendanceResponse> updateWorkMode(
            @RequestParam com.ems.entity.WorkMode workMode,
            Principal principal) {
        return ResponseEntity.ok(attendanceService.updateWorkMode(principal.getName(), workMode));
    }

    @PostMapping("/today/breaks")
    public ResponseEntity<AttendanceResponse> addBreak(
            @Valid @RequestBody com.ems.dto.request.AddBreakRequest request,
            Principal principal) {
        return ResponseEntity.ok(attendanceService.addBreak(principal.getName(), request));
    }

    @DeleteMapping("/today/breaks/{breakId}")
    public ResponseEntity<AttendanceResponse> deleteBreak(
            @PathVariable Long breakId,
            Principal principal) {
        return ResponseEntity.ok(attendanceService.removeBreak(principal.getName(), breakId));
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceResponse> checkOut(Principal principal) {
        return ResponseEntity.ok(attendanceService.checkOut(principal.getName()));
    }

    @GetMapping("/today")
    public ResponseEntity<AttendanceResponse> getTodayAttendance(Principal principal) {
        AttendanceResponse today = attendanceService.getTodayAttendance(principal.getName());
        return ResponseEntity.ok(today);
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(Principal principal) {
        return ResponseEntity.ok(attendanceService.getMyAttendance(principal.getName()));
    }

    @GetMapping("/{date}")
    public ResponseEntity<AttendanceResponse> getMyAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Principal principal) {
        return ResponseEntity.ok(attendanceService.getMyAttendanceByDate(principal.getName(), date));
    }
}
