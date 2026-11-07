package com.ems.service;

import com.ems.dto.request.CreateLeaveRequest;
import com.ems.dto.request.RejectLeaveRequest;
import com.ems.dto.response.LeaveResponse;

import java.util.List;

public interface LeaveService {
    
    // Employee
    LeaveResponse applyLeave(String username, CreateLeaveRequest request);
    List<LeaveResponse> getMyLeaves(String username);
    LeaveResponse getMyLeave(String username, Long leaveId);
    LeaveResponse cancelLeave(String username, Long leaveId);

    // Manager
    List<LeaveResponse> getManagerLeaves(String managerUsername);
    LeaveResponse getManagerLeave(String managerUsername, Long leaveId);
    LeaveResponse approveManagerLeave(String managerUsername, Long leaveId);
    LeaveResponse rejectManagerLeave(String managerUsername, Long leaveId, RejectLeaveRequest request);

    // Admin
    List<LeaveResponse> getAllLeaves();
    List<LeaveResponse> getEmployeeLeaves(Long employeeId);
    LeaveResponse getLeave(Long leaveId);
    LeaveResponse approveAdminLeave(Long leaveId);
    LeaveResponse rejectAdminLeave(Long leaveId);
}
