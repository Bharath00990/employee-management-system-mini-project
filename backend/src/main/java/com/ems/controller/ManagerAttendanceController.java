package com.ems.controller;

import com.ems.dto.response.AttendanceResponse;
import com.ems.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/manager/attendance")
public class ManagerAttendanceController {

    private final AttendanceService attendanceService;

    public ManagerAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getTeamAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Principal principal) {
        if (date != null) {
            return ResponseEntity.ok(attendanceService.getManagerTeamAttendanceByDate(principal.getName(), date));
        }
        return ResponseEntity.ok(attendanceService.getManagerTeamAttendance(principal.getName()));
    }
}
