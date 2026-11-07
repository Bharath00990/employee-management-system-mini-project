package com.ems.service;

import com.ems.dto.request.CreateSalaryRequest;
import com.ems.dto.response.SalaryResponse;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.Salary;
import com.ems.entity.User;
import com.ems.exception.DuplicateResourceException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.SalaryRepository;
import com.ems.service.impl.SalaryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalaryServiceImplTest {

    @Mock
    private SalaryRepository salaryRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private SalaryServiceImpl salaryService;

    private Employee employee;
    private User employeeUser;

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
    }

    @Test
    void createSalary_Success() {
        CreateSalaryRequest request = new CreateSalaryRequest();
        request.setEmployeeId(10L);
        request.setMonth(1);
        request.setYear(2026);
        request.setBasicSalary(new BigDecimal("50000.00"));
        request.setDeductions(new BigDecimal("2000.00"));

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(salaryRepository.findByEmployeeIdAndMonthAndYear(10L, 1, 2026)).thenReturn(Optional.empty());
        
        Salary savedSalary = new Salary();
        savedSalary.setId(100L);
        savedSalary.setEmployee(employee);
        savedSalary.setMonth(1);
        savedSalary.setYear(2026);
        savedSalary.setBasicSalary(request.getBasicSalary());
        savedSalary.setDeductions(request.getDeductions());
        savedSalary.setNetSalary(new BigDecimal("48000.00"));

        when(salaryRepository.save(any(Salary.class))).thenReturn(savedSalary);

        SalaryResponse response = salaryService.createSalary(request);

        assertNotNull(response);
        assertEquals(100L, response.getSalaryId());
        assertEquals(new BigDecimal("48000.00"), response.getNetSalary());
        verify(salaryRepository).save(any(Salary.class));
    }

    @Test
    void createSalary_Duplicate() {
        CreateSalaryRequest request = new CreateSalaryRequest();
        request.setEmployeeId(10L);
        request.setMonth(1);
        request.setYear(2026);
        request.setBasicSalary(new BigDecimal("50000.00"));
        request.setDeductions(new BigDecimal("2000.00"));

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(salaryRepository.findByEmployeeIdAndMonthAndYear(10L, 1, 2026))
                .thenReturn(Optional.of(new Salary()));

        assertThrows(DuplicateResourceException.class, () -> salaryService.createSalary(request));
    }
}
