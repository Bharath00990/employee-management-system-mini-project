package com.ems.service;

import com.ems.dto.request.CreateLeaveRequest;
import com.ems.dto.request.RejectLeaveRequest;
import com.ems.dto.response.LeaveResponse;
import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.entity.LeaveStatus;
import com.ems.entity.LeaveType;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.service.impl.LeaveServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceImplTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private LeaveServiceImpl leaveService;

    private Employee employee;
    private Employee manager;
    private User employeeUser;
    private User managerUser;

    @BeforeEach
    void setUp() {
        employeeUser = new User();
        employeeUser.setId(1L);
        employeeUser.setUsername("emp1");
        employeeUser.setRole(Role.EMPLOYEE);

        employee = new Employee();
        employee.setId(10L);
        employee.setUser(employeeUser);
        employee.setEmployeeCode("E001");
        employee.setFirstName("John");
        employee.setLastName("Doe");

        managerUser = new User();
        managerUser.setId(2L);
        managerUser.setUsername("mgr1");
        managerUser.setRole(Role.PROJECT_MANAGER);

        manager = new Employee();
        manager.setId(20L);
        manager.setUser(managerUser);
        manager.setEmployeeCode("M001");
        manager.setFirstName("Jane");
        manager.setLastName("Smith");
    }

    @Test
    void applyLeave_Success() {
        CreateLeaveRequest request = new CreateLeaveRequest();
        request.setLeaveType(LeaveType.CASUAL);
        request.setStartDate(LocalDate.now().plusDays(1));
        request.setEndDate(LocalDate.now().plusDays(3));
        request.setReason("Vacation");

        when(employeeRepository.findByUserUsername("emp1")).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.countOverlappingLeaves(eq(10L), any(), any(), any())).thenReturn(0L);
        
        LeaveRequest savedLeave = new LeaveRequest();
        savedLeave.setId(100L);
        savedLeave.setEmployee(employee);
        savedLeave.setLeaveType(LeaveType.CASUAL);
        savedLeave.setStartDate(request.getStartDate());
        savedLeave.setEndDate(request.getEndDate());
        savedLeave.setReason(request.getReason());
        savedLeave.setStatus(LeaveStatus.PENDING);
        
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(savedLeave);

        LeaveResponse response = leaveService.applyLeave("emp1", request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(LeaveStatus.PENDING, response.getStatus());
        verify(leaveRequestRepository).save(any(LeaveRequest.class));
    }

    @Test
    void applyLeave_Overlapping() {
        CreateLeaveRequest request = new CreateLeaveRequest();
        request.setLeaveType(LeaveType.CASUAL);
        request.setStartDate(LocalDate.now().plusDays(1));
        request.setEndDate(LocalDate.now().plusDays(3));

        when(employeeRepository.findByUserUsername("emp1")).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.countOverlappingLeaves(eq(10L), any(), any(), any())).thenReturn(1L);

        assertThrows(IllegalStateException.class, () -> leaveService.applyLeave("emp1", request));
    }

    @Test
    void applyLeave_PastDate() {
        CreateLeaveRequest request = new CreateLeaveRequest();
        request.setLeaveType(LeaveType.CASUAL);
        request.setStartDate(LocalDate.now().minusDays(1));
        request.setEndDate(LocalDate.now().plusDays(3));

        assertThrows(IllegalArgumentException.class, () -> leaveService.applyLeave("emp1", request));
    }

    @Test
    void cancelLeave_Success() {
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setId(100L);
        leaveRequest.setEmployee(employee);
        leaveRequest.setStatus(LeaveStatus.PENDING);

        when(employeeRepository.findByUserUsername("emp1")).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        LeaveResponse response = leaveService.cancelLeave("emp1", 100L);

        assertEquals(LeaveStatus.CANCELLED, response.getStatus());
    }

    @Test
    void cancelLeave_NotPending() {
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setId(100L);
        leaveRequest.setEmployee(employee);
        leaveRequest.setStatus(LeaveStatus.APPROVED);

        when(employeeRepository.findByUserUsername("emp1")).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(leaveRequest));

        assertThrows(IllegalStateException.class, () -> leaveService.cancelLeave("emp1", 100L));
    }

    @Test
    void managerApproveLeave_Success() {
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setId(100L);
        leaveRequest.setEmployee(employee);
        leaveRequest.setStatus(LeaveStatus.PENDING);

        when(employeeRepository.findByUserUsername("mgr1")).thenReturn(Optional.of(manager));
        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRequestRepository.findLeavesForManager(20L)).thenReturn(Arrays.asList(leaveRequest));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        LeaveResponse response = leaveService.approveManagerLeave("mgr1", 100L);

        assertEquals(LeaveStatus.APPROVED, response.getStatus());
        assertEquals("mgr1", response.getApprovedBy());
    }

    @Test
    void managerApproveLeave_UnrelatedEmployee() {
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setId(100L);
        leaveRequest.setEmployee(employee);

        when(employeeRepository.findByUserUsername("mgr1")).thenReturn(Optional.of(manager));
        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRequestRepository.findLeavesForManager(20L)).thenReturn(List.of()); // Not managing this leave

        assertThrows(AccessDeniedException.class, () -> leaveService.approveManagerLeave("mgr1", 100L));
    }
}
