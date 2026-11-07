package com.ems.controller;

import com.ems.dto.response.ProjectAssignmentResponse;
import com.ems.dto.response.ProjectResponse;
import com.ems.service.ProjectAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/employee/projects")
public class EmployeeProjectController {

    private final ProjectAssignmentService projectAssignmentService;

    public EmployeeProjectController(ProjectAssignmentService projectAssignmentService) {
        this.projectAssignmentService = projectAssignmentService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects(Principal principal) {
        return ResponseEntity.ok(projectAssignmentService.getEmployeeProjects(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectDetails(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(projectAssignmentService.getEmployeeProjectDetails(id, principal.getName()));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<ProjectAssignmentResponse>> getMyAssignments(Principal principal) {
        return ResponseEntity.ok(projectAssignmentService.getEmployeeAssignments(principal.getName()));
    }
}
