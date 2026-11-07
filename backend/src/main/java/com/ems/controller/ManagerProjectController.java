package com.ems.controller;

import com.ems.dto.request.ProjectAssignmentCreateRequest;
import com.ems.dto.response.ProjectAssignmentResponse;
import com.ems.dto.response.ProjectResponse;
import com.ems.service.ProjectAssignmentService;
import com.ems.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/manager/projects")
public class ManagerProjectController {

    private final ProjectService projectService;
    private final ProjectAssignmentService projectAssignmentService;

    public ManagerProjectController(ProjectService projectService, ProjectAssignmentService projectAssignmentService) {
        this.projectService = projectService;
        this.projectAssignmentService = projectAssignmentService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects(Principal principal) {
        return ResponseEntity.ok(projectService.getProjectsByManagerUsername(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectDetails(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(projectService.getProjectByIdAndManagerUsername(id, principal.getName()));
    }

    @GetMapping("/{projectId}/employees")
    public ResponseEntity<List<ProjectAssignmentResponse>> getProjectTeam(@PathVariable Long projectId, Principal principal) {
        return ResponseEntity.ok(projectAssignmentService.getProjectTeam(projectId, principal.getName()));
    }

    @PostMapping("/{projectId}/employees")
    public ResponseEntity<ProjectAssignmentResponse> assignEmployee(@PathVariable Long projectId, 
                                                                    @Valid @RequestBody ProjectAssignmentCreateRequest request, 
                                                                    Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectAssignmentService.assignEmployee(projectId, request, principal.getName()));
    }

    @DeleteMapping("/{projectId}/employees/{employeeId}")
    public ResponseEntity<Void> removeEmployee(@PathVariable Long projectId, 
                                               @PathVariable Long employeeId, 
                                               Principal principal) {
        projectAssignmentService.removeEmployee(projectId, employeeId, principal.getName());
        return ResponseEntity.ok().build();
    }
}
