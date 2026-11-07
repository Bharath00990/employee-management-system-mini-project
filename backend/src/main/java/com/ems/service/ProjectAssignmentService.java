package com.ems.service;

import com.ems.dto.request.ProjectAssignmentCreateRequest;
import com.ems.dto.response.ProjectAssignmentResponse;
import com.ems.dto.response.ProjectResponse;
import java.util.List;

public interface ProjectAssignmentService {
    ProjectAssignmentResponse assignEmployee(Long projectId, ProjectAssignmentCreateRequest request, String managerUsername);
    void removeEmployee(Long projectId, Long employeeId, String managerUsername);
    List<ProjectAssignmentResponse> getProjectTeam(Long projectId, String managerUsername);

    // Admin-level methods (no manager authorization check)
    ProjectAssignmentResponse adminAssignEmployee(Long projectId, ProjectAssignmentCreateRequest request);
    void adminRemoveEmployee(Long projectId, Long employeeId);
    List<ProjectAssignmentResponse> adminGetProjectTeam(Long projectId);

    List<ProjectResponse> getEmployeeProjects(String employeeUsername);
    ProjectResponse getEmployeeProjectDetails(Long projectId, String employeeUsername);
    List<ProjectAssignmentResponse> getEmployeeAssignments(String employeeUsername);
}

