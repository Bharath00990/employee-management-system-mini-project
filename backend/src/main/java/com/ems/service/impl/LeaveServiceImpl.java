package com.ems.service.impl;

import com.ems.dto.request.CreateLeaveRequest;
import com.ems.dto.request.RejectLeaveRequest;
import com.ems.dto.response.LeaveResponse;
import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.entity.LeaveStatus;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.service.LeaveService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveServiceImpl(LeaveRequestRepository leaveRequestRepository, EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    private Employee getEmployeeByUsername(String username) {
        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for username: " + username));
    }

    private LeaveResponse mapToResponse(LeaveRequest leaveRequest) {
        LeaveResponse response = new LeaveResponse();
        response.setId(leaveRequest.getId());
        response.setEmployeeId(leaveRequest.getEmployee().getId());
        response.setEmployeeCode(leaveRequest.getEmployee().getEmployeeCode());
        response.setEmployeeName(leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
        response.setLeaveType(leaveRequest.getLeaveType());
        response.setStartDate(leaveRequest.getStartDate());
        response.setEndDate(leaveRequest.getEndDate());
        response.setReason(leaveRequest.getReason());
        response.setStatus(leaveRequest.getStatus());
        if (leaveRequest.getApprovedBy() != null) {
            response.setApprovedBy(leaveRequest.getApprovedBy().getUsername());
        }
        response.setCreatedAt(leaveRequest.getCreatedAt());
        response.setUpdatedAt(leaveRequest.getUpdatedAt());
        return response;
    }

    @Override
    @Transactional
    public LeaveResponse applyLeave(String username, CreateLeaveRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
        if (request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        Employee employee = getEmployeeByUsername(username);

        long overlappingLeaves = leaveRequestRepository.countOverlappingLeaves(
                employee.getId(),
                Arrays.asList(LeaveStatus.PENDING, LeaveStatus.APPROVED),
                request.getStartDate(),
                request.getEndDate()
        );

        if (overlappingLeaves > 0) {
            throw new IllegalStateException("Leave request overlaps with an existing pending or approved leave");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setReason(request.getReason());
        leaveRequest.setStatus(LeaveStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    public List<LeaveResponse> getMyLeaves(String username) {
        Employee employee = getEmployeeByUsername(username);
        return leaveRequestRepository.findByEmployeeId(employee.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public LeaveResponse getMyLeave(String username, Long leaveId) {
        Employee employee = getEmployeeByUsername(username);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!leaveRequest.getEmployee().getId().equals(employee.getId())) {
            throw new AccessDeniedException("You can only access your own leave requests");
        }
        return mapToResponse(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveResponse cancelLeave(String username, Long leaveId) {
        Employee employee = getEmployeeByUsername(username);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!leaveRequest.getEmployee().getId().equals(employee.getId())) {
            throw new AccessDeniedException("You can only cancel your own leave requests");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leave requests can be cancelled");
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    public List<LeaveResponse> getManagerLeaves(String managerUsername) {
        Employee manager = getEmployeeByUsername(managerUsername);
        List<LeaveRequest> leaves = leaveRequestRepository.findLeavesForManager(manager.getId());
        return leaves.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public LeaveResponse getManagerLeave(String managerUsername, Long leaveId) {
        Employee manager = getEmployeeByUsername(managerUsername);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        boolean isManaged = leaveRequestRepository.findLeavesForManager(manager.getId()).stream()
                .anyMatch(l -> l.getId().equals(leaveId));
        
        if (!isManaged) {
            throw new AccessDeniedException("Leave request does not belong to your managed projects");
        }

        return mapToResponse(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveResponse approveManagerLeave(String managerUsername, Long leaveId) {
        Employee manager = getEmployeeByUsername(managerUsername);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        boolean isManaged = leaveRequestRepository.findLeavesForManager(manager.getId()).stream()
                .anyMatch(l -> l.getId().equals(leaveId));
        
        if (!isManaged) {
            throw new AccessDeniedException("Leave request does not belong to your managed projects");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leave requests can be approved");
        }

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setApprovedBy(manager.getUser());
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LeaveResponse rejectManagerLeave(String managerUsername, Long leaveId, RejectLeaveRequest request) {
        Employee manager = getEmployeeByUsername(managerUsername);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        boolean isManaged = leaveRequestRepository.findLeavesForManager(manager.getId()).stream()
                .anyMatch(l -> l.getId().equals(leaveId));
        
        if (!isManaged) {
            throw new AccessDeniedException("Leave request does not belong to your managed projects");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leave requests can be rejected");
        }

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setApprovedBy(manager.getUser());
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    public List<LeaveResponse> getAllLeaves() {
        return leaveRequestRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<LeaveResponse> getEmployeeLeaves(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found");
        }
        return leaveRequestRepository.findByEmployeeId(employeeId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public LeaveResponse getLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        return mapToResponse(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveResponse approveAdminLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leave requests can be approved");
        }

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LeaveResponse rejectAdminLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leave requests can be rejected");
        }

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }
}
