package com.ems.service;

import com.ems.dto.request.CreateAttendanceRequest;
import com.ems.dto.request.UpdateAttendanceStatusRequest;
import com.ems.dto.response.AttendanceResponse;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    // Employee methods
    AttendanceResponse markAttendance(String username, CreateAttendanceRequest request);
    AttendanceResponse checkIn(String username);
    AttendanceResponse checkIn(String username, com.ems.entity.WorkMode workMode);
    AttendanceResponse updateWorkMode(String username, com.ems.entity.WorkMode workMode);
    AttendanceResponse addBreak(String username, com.ems.dto.request.AddBreakRequest request);
    AttendanceResponse removeBreak(String username, Long breakId);
    AttendanceResponse checkOut(String username);
    AttendanceResponse getTodayAttendance(String username);
    List<AttendanceResponse> getMyAttendance(String username);
    AttendanceResponse getMyAttendanceByDate(String username, LocalDate date);
    
    // Manager methods
    List<AttendanceResponse> getManagerTeamAttendance(String managerUsername);
    List<AttendanceResponse> getManagerTeamAttendanceByDate(String managerUsername, LocalDate date);
    
    // Admin methods
    List<AttendanceResponse> getAllAttendance();
    List<AttendanceResponse> getAttendanceByDate(LocalDate date);
    List<AttendanceResponse> getEmployeeAttendance(Long employeeId);
    AttendanceResponse getEmployeeAttendanceByDate(Long employeeId, LocalDate date);
    AttendanceResponse updateAttendanceStatus(Long attendanceId, UpdateAttendanceStatusRequest request);
}
