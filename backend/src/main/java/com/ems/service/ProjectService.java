package com.ems.service;

import com.ems.dto.request.ProjectCreateRequest;
import com.ems.dto.request.ProjectManagerChangeRequest;
import com.ems.dto.request.ProjectStatusRequest;
import com.ems.dto.request.ProjectUpdateRequest;
import com.ems.dto.response.ProjectResponse;
import java.util.List;

public interface ProjectService {
    ProjectResponse createProject(ProjectCreateRequest request);
    List<ProjectResponse> getAllProjects();
    ProjectResponse getProjectById(Long id);
    ProjectResponse updateProject(Long id, ProjectUpdateRequest request);
    ProjectResponse changeProjectManager(Long id, ProjectManagerChangeRequest request);
    ProjectResponse changeProjectStatus(Long id, ProjectStatusRequest request);
    
    List<ProjectResponse> getProjectsByManagerUsername(String username);
    ProjectResponse getProjectByIdAndManagerUsername(Long id, String username);
}
