package com.ems.controller;

import com.ems.dto.response.SalaryResponse;
import com.ems.service.SalaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/employee/salary")
public class EmployeeSalaryController {

    private final SalaryService salaryService;

    public EmployeeSalaryController(SalaryService salaryService) {
        this.salaryService = salaryService;
    }

    @GetMapping
    public ResponseEntity<List<SalaryResponse>> getMySalaries(Principal principal) {
        return ResponseEntity.ok(salaryService.getMySalaries(principal.getName()));
    }
}
