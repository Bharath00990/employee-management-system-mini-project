package com.ems.controller;

import com.ems.dto.request.CreateEmployeeProfileRequest;
import com.ems.dto.request.CreateEmployeeRequest;
import com.ems.dto.request.ProjectManagerRequest;
import com.ems.dto.request.UpdateEmployeeRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.UserResponse;
import com.ems.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminEmployeeController {

    private final EmployeeService employeeService;

    public AdminEmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/employees")
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/project-managers")
    public ResponseEntity<EmployeeResponse> createProjectManager(@Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.createProjectManager(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/project-managers/{userId}/employee-profile")
    public ResponseEntity<EmployeeResponse> attachEmployeeProfileToProjectManager(
            @PathVariable Long userId, 
            @Valid @RequestBody CreateEmployeeProfileRequest request) {
        EmployeeResponse response = employeeService.attachEmployeeProfileToProjectManager(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(@PathVariable Long id, @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }
}
