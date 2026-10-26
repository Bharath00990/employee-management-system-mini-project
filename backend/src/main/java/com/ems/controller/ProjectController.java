package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.entity.Employee;
import com.ems.entity.Project;
import com.ems.entity.ProjectAssignment;
import com.ems.exception.BadRequestException;
import com.ems.exception.ConflictException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectAssignmentRepository;
import com.ems.repository.ProjectRepository;
import com.ems.security.UserDetailsImpl;
import com.ems.service.AuditLogService;
import com.ems.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Data
    public static class ProjectRequest {
        private String projectName;
        private String description;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private Integer progressPercentage;
        private Long projectManagerId;
    }

    @Data
    public static class AssignmentRequest {
        private Long employeeId;
        private String projectRole;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        String st = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;
        String s = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<Project> list = projectRepository.filterProjects(st, s);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProjectDetails(@PathVariable Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        List<ProjectAssignment> assignments = projectAssignmentRepository.findByProjectId(id);

        Map<String, Object> res = new HashMap<>();
        res.put("project", project);
        res.put("teamMembers", assignments);

        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Project>>> getMyProjects(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        Employee emp = employeeRepository.findByUserId(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Current user has no associated employee profile"));

        List<ProjectAssignment> assignments = projectAssignmentRepository.findByEmployeeId(emp.getId());
        List<Project> projects = assignments.stream().map(ProjectAssignment::getProject).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody ProjectRequest req, HttpServletRequest request) {
        Project.ProjectBuilder builder = Project.builder()
                .projectName(req.getProjectName())
                .description(req.getDescription())
                .startDate(req.getStartDate() != null ? req.getStartDate() : LocalDate.now())
                .endDate(req.getEndDate())
                .status(req.getStatus() != null ? req.getStatus() : "PLANNED")
                .progressPercentage(req.getProgressPercentage() != null ? req.getProgressPercentage() : 0);

        if (req.getProjectManagerId() != null) {
            Employee mgr = employeeRepository.findById(req.getProjectManagerId()).orElse(null);
            builder.projectManager(mgr);
        }

        Project saved = projectRepository.save(builder.build());
        auditLogService.log("PROJECT_CREATED", request.getUserPrincipal().getName(), "MANAGER", "Project", saved.getId(), "Created project: " + saved.getProjectName(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Project created successfully", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Project>> updateProject(@PathVariable Long id, @RequestBody ProjectRequest req, HttpServletRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setProjectName(req.getProjectName());
        project.setDescription(req.getDescription());
        if (req.getStartDate() != null) project.setStartDate(req.getStartDate());
        project.setEndDate(req.getEndDate());
        if (req.getStatus() != null) project.setStatus(req.getStatus());
        if (req.getProgressPercentage() != null) project.setProgressPercentage(req.getProgressPercentage());

        if (req.getProjectManagerId() != null) {
            Employee mgr = employeeRepository.findById(req.getProjectManagerId()).orElse(null);
            project.setProjectManager(mgr);
        }

        Project updated = projectRepository.save(project);
        auditLogService.log("PROJECT_UPDATED", request.getUserPrincipal().getName(), "MANAGER", "Project", id, "Updated project: " + updated.getProjectName(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", updated));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProjectAssignment>> assignMember(
            @PathVariable Long id,
            @RequestBody AssignmentRequest req,
            HttpServletRequest request) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + req.getEmployeeId()));

        if (projectAssignmentRepository.findByProjectIdAndEmployeeId(id, emp.getId()).isPresent()) {
            throw new ConflictException("Employee is already assigned to this project");
        }

        ProjectAssignment assignment = ProjectAssignment.builder()
                .project(project)
                .employee(emp)
                .projectRole(req.getProjectRole() != null ? req.getProjectRole() : "Member")
                .assignedDate(LocalDate.now())
                .build();

        ProjectAssignment saved = projectAssignmentRepository.save(assignment);

        // Notify employee
        if (emp.getUser() != null) {
            notificationService.createNotification(
                    emp.getUser(),
                    "Assigned to Project",
                    "You have been assigned to project: " + project.getProjectName() + " as " + assignment.getProjectRole(),
                    "INFO",
                    "/employee/projects"
            );
        }

        auditLogService.log("PROJECT_ASSIGNMENT", request.getUserPrincipal().getName(), "MANAGER", "ProjectAssignment", saved.getId(), "Assigned " + emp.getFirstName() + " to " + project.getProjectName(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Employee assigned to project", saved));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProjectStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", projectRepository.count());
        stats.put("inProgress", projectRepository.countByStatus("IN_PROGRESS"));
        stats.put("completed", projectRepository.countByStatus("COMPLETED"));
        stats.put("planned", projectRepository.countByStatus("PLANNED"));
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

