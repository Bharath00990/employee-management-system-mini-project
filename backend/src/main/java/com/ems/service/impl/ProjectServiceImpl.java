package com.ems.service.impl;

import com.ems.dto.request.ProjectCreateRequest;
import com.ems.dto.request.ProjectManagerChangeRequest;
import com.ems.dto.request.ProjectStatusRequest;
import com.ems.dto.request.ProjectUpdateRequest;
import com.ems.dto.response.ProjectResponse;
import com.ems.entity.Employee;
import com.ems.entity.Project;
import com.ems.entity.ProjectStatus;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectRepository;
import com.ems.service.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository, EmployeeRepository employeeRepository) {
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        if (projectRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Project name already exists");
        }
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(ProjectStatus.PLANNED);

        if (request.getManagerId() != null) {
            Employee manager = validateManager(request.getManagerId());
            project.setManager(manager);
        }

        project = projectRepository.save(project);
        return mapToResponse(project);
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return mapToResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectUpdateRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                
        if (!project.getName().equals(request.getName()) && projectRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Project name already exists");
        }
        
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(request.getStatus());

        if (request.getManagerId() != null) {
            Employee manager = validateManager(request.getManagerId());
            project.setManager(manager);
        } else {
            project.setManager(null);
        }

        projectRepository.save(project);
        return mapToResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse changeProjectManager(Long id, ProjectManagerChangeRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                
        Employee manager = validateManager(request.getManagerId());
        project.setManager(manager);
        projectRepository.save(project);
        return mapToResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse changeProjectStatus(Long id, ProjectStatusRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        project.setStatus(request.getStatus());
        projectRepository.save(project);
        return mapToResponse(project);
    }

    @Override
    public List<ProjectResponse> getProjectsByManagerUsername(String username) {
        Employee manager = employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Manager profile not found"));
                
        return projectRepository.findByManagerId(manager.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectByIdAndManagerUsername(Long id, String username) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                
        if (project.getManager() == null || !project.getManager().getUser().getUsername().equals(username)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to access this project");
        }
        
        return mapToResponse(project);
    }
    
    private Employee validateManager(Long managerId) {
        Employee employee = employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager employee not found"));
        
        if (employee.getUser() == null || !"PROJECT_MANAGER".equals(employee.getUser().getRole().name())) {
            throw new IllegalArgumentException("Employee is not a PROJECT_MANAGER");
        }
        return employee;
    }

    private ProjectResponse mapToResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setStatus(project.getStatus().name());
        
        if (project.getManager() != null) {
            response.setManagerId(project.getManager().getId());
            response.setManagerName(project.getManager().getFirstName() + " " + project.getManager().getLastName());
        }
        
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        return response;
    }
}
