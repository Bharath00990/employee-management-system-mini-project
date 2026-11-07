package com.ems.controller;

import com.ems.dto.request.ProjectAssignmentCreateRequest;
import com.ems.dto.request.ProjectCreateRequest;
import com.ems.dto.request.ProjectManagerChangeRequest;
import com.ems.dto.request.ProjectStatusRequest;
import com.ems.dto.request.ProjectUpdateRequest;
import com.ems.dto.response.ProjectAssignmentResponse;
import com.ems.dto.response.ProjectResponse;
import com.ems.service.ProjectAssignmentService;
import com.ems.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
public class AdminProjectController {

    private final ProjectService projectService;
    private final ProjectAssignmentService projectAssignmentService;

    public AdminProjectController(ProjectService projectService, ProjectAssignmentService projectAssignmentService) {
        this.projectService = projectService;
        this.projectAssignmentService = projectAssignmentService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectUpdateRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @PatchMapping("/{id}/manager")
    public ResponseEntity<ProjectResponse> changeProjectManager(@PathVariable Long id, @Valid @RequestBody ProjectManagerChangeRequest request) {
        return ResponseEntity.ok(projectService.changeProjectManager(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectResponse> changeProjectStatus(@PathVariable Long id, @Valid @RequestBody ProjectStatusRequest request) {
        return ResponseEntity.ok(projectService.changeProjectStatus(id, request));
    }

    // Team management endpoints
    @GetMapping("/{projectId}/employees")
    public ResponseEntity<List<ProjectAssignmentResponse>> getProjectTeam(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectAssignmentService.adminGetProjectTeam(projectId));
    }

    @PostMapping("/{projectId}/employees")
    public ResponseEntity<ProjectAssignmentResponse> assignEmployee(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectAssignmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectAssignmentService.adminAssignEmployee(projectId, request));
    }

    @DeleteMapping("/{projectId}/employees/{employeeId}")
    public ResponseEntity<Void> removeEmployee(
            @PathVariable Long projectId,
            @PathVariable Long employeeId) {
        projectAssignmentService.adminRemoveEmployee(projectId, employeeId);
        return ResponseEntity.ok().build();
    }
}

