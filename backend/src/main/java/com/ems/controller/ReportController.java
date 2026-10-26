package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SalaryRepository salaryRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ProjectRepository projectRepository;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExecutiveSummary() {
        Map<String, Object> summary = new HashMap<>();

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.findByStatus("ACTIVE").size();
        long pendingLeaves = leaveRequestRepository.countByStatus("PENDING");
        long totalProjects = projectRepository.count();
        long inProgressProjects = projectRepository.countByStatus("IN_PROGRESS");
        long availableParking = parkingSlotRepository.countByStatus("AVAILABLE");
        long presentToday = attendanceRepository.countByDateAndStatus(LocalDate.now(), "PRESENT");
        Double totalPayroll = salaryRepository.sumTotalPayroll();

        summary.put("totalEmployees", totalEmployees);
        summary.put("activeEmployees", activeEmployees);
        summary.put("pendingLeaves", pendingLeaves);
        summary.put("totalProjects", totalProjects);
        summary.put("inProgressProjects", inProgressProjects);
        summary.put("availableParking", availableParking);
        summary.put("presentToday", presentToday);
        summary.put("totalPayroll", totalPayroll != null ? totalPayroll : 0.0);

        // Department breakdown
        List<String> departments = List.of("Engineering", "Product & Design", "QA & Testing", "Human Resources", "Finance", "Marketing");
        Map<String, Integer> deptCounts = new HashMap<>();
        for (String dept : departments) {
            deptCounts.put(dept, employeeRepository.findByDepartment(dept).size());
        }
        summary.put("departmentBreakdown", deptCounts);

        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
