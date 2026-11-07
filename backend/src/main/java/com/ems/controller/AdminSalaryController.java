package com.ems.controller;

import com.ems.dto.request.CreateSalaryRequest;
import com.ems.dto.request.UpdateSalaryRequest;
import com.ems.dto.response.SalaryResponse;
import com.ems.service.SalaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/salaries")
public class AdminSalaryController {

    private final SalaryService salaryService;

    public AdminSalaryController(SalaryService salaryService) {
        this.salaryService = salaryService;
    }

    @PostMapping
    public ResponseEntity<SalaryResponse> createSalary(@Valid @RequestBody CreateSalaryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salaryService.createSalary(request));
    }

    @GetMapping
    public ResponseEntity<List<SalaryResponse>> getAllSalaries() {
        return ResponseEntity.ok(salaryService.getAllSalaries());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SalaryResponse>> getEmployeeSalaries(@PathVariable Long employeeId) {
        return ResponseEntity.ok(salaryService.getEmployeeSalaries(employeeId));
    }

    @GetMapping("/{salaryId}")
    public ResponseEntity<SalaryResponse> getSalary(@PathVariable Long salaryId) {
        return ResponseEntity.ok(salaryService.getSalary(salaryId));
    }

    @PutMapping("/{salaryId}")
    public ResponseEntity<SalaryResponse> updateSalary(@PathVariable Long salaryId, @Valid @RequestBody UpdateSalaryRequest request) {
        return ResponseEntity.ok(salaryService.updateSalary(salaryId, request));
    }
}
