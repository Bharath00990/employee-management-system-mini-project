package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.entity.ERole;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.exception.ConflictException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.RoleRepository;
import com.ems.repository.UserRepository;
import com.ems.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Employee>>> getAllEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status) {
        
        String s = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String d = (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL")) ? department.trim() : null;
        String st = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;

        List<Employee> list = employeeRepository.searchEmployees(s, d, st);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Employee>> createEmployee(@RequestBody Employee req, HttpServletRequest request) {
        if (employeeRepository.existsByEmployeeId(req.getEmployeeId())) {
            throw new ConflictException("Employee ID " + req.getEmployeeId() + " already exists");
        }
        if (employeeRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Employee Email " + req.getEmail() + " already exists");
        }

        // Auto create corresponding login User account
        String baseUsername = req.getEmail().split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        String username = baseUsername;
        int count = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + count++;
        }

        Role employeeRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE).orElseThrow();
        User newUser = userRepository.save(User.builder()
                .username(username)
                .email(req.getEmail())
                .password(passwordEncoder.encode("Welcome@123"))
                .roles(Set.of(employeeRole))
                .active(true)
                .build());

        req.setUser(newUser);
        if (req.getJoiningDate() == null) req.setJoiningDate(LocalDate.now());
        if (req.getStatus() == null) req.setStatus("ACTIVE");

        Employee saved = employeeRepository.save(req);
        auditLogService.log("EMPLOYEE_CREATED", request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "ADMIN", "ROLE_ADMIN", "Employee", saved.getId(), "Created employee " + saved.getEmployeeId() + " (" + saved.getFirstName() + " " + saved.getLastName() + ")", request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Employee created successfully with username: " + username, saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(@PathVariable Long id, @RequestBody Employee req, HttpServletRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setFirstName(req.getFirstName());
        employee.setLastName(req.getLastName());
        employee.setPhone(req.getPhone());
        employee.setDepartment(req.getDepartment());
        employee.setDesignation(req.getDesignation());
        if (req.getSalary() != null) employee.setSalary(req.getSalary());
        if (req.getStatus() != null) employee.setStatus(req.getStatus());

        Employee updated = employeeRepository.save(employee);
        auditLogService.log("EMPLOYEE_UPDATED", request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "ADMIN", "ROLE_ADMIN", "Employee", updated.getId(), "Updated employee details for " + updated.getEmployeeId(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id, HttpServletRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employeeRepository.delete(employee);
        auditLogService.log("EMPLOYEE_DELETED", request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "ADMIN", "ROLE_ADMIN", "Employee", id, "Deleted employee " + employee.getEmployeeId(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }
}

