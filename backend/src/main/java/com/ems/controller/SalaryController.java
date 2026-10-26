package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.entity.Employee;
import com.ems.entity.Salary;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.SalaryRepository;
import com.ems.security.UserDetailsImpl;
import com.ems.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salaries")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    @Data
    public static class SalaryCreateRequest {
        private Long employeeId;
        private String month;
        private Integer year;
        private Double basicPay;
        private Double allowances;
        private Double deductions;
        private String paymentStatus;
        private String remarks;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<Salary>>> getAllSalaries(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Integer year) {
        List<Salary> list;
        if (month != null && year != null) {
            list = salaryRepository.findByMonthAndYear(month, year);
        } else {
            list = salaryRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Salary>>> getMySalaries(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Current user has no associated employee profile"));

        List<Salary> list = salaryRepository.findByEmployeeIdOrderByYearDescMonthDesc(emp.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/employee/{empId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<Salary>>> getEmployeeSalaries(@PathVariable Long empId) {
        List<Salary> list = salaryRepository.findByEmployeeIdOrderByYearDescMonthDesc(empId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Salary>> createOrUpdateSalary(@RequestBody SalaryCreateRequest req, HttpServletRequest request) {
        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + req.getEmployeeId()));

        Salary salary = salaryRepository.findByEmployeeIdAndMonthAndYear(emp.getId(), req.getMonth(), req.getYear())
                .orElse(Salary.builder().employee(emp).month(req.getMonth()).year(req.getYear()).build());

        salary.setBasicPay(req.getBasicPay());
        salary.setAllowances(req.getAllowances() != null ? req.getAllowances() : 0.0);
        salary.setDeductions(req.getDeductions() != null ? req.getDeductions() : 0.0);
        salary.calculateNetPay();
        if (req.getPaymentStatus() != null) salary.setPaymentStatus(req.getPaymentStatus());
        if (req.getRemarks() != null) salary.setRemarks(req.getRemarks());

        Salary saved = salaryRepository.save(salary);
        auditLogService.log("SALARY_UPDATED", request.getUserPrincipal().getName(), "ADMIN", "Salary", saved.getId(), "Payroll processed for " + emp.getEmployeeId() + " (" + req.getMonth() + " " + req.getYear() + ")", request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Salary recorded successfully", saved));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPayrollStats() {
        Double totalPayroll = salaryRepository.sumTotalPayroll();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPayroll", totalPayroll != null ? totalPayroll : 0.0);
        stats.put("activeEmployeesCount", employeeRepository.count());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
