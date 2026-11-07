package com.ems.service.impl;

import com.ems.dto.request.ProjectAssignmentCreateRequest;
import com.ems.dto.response.ProjectAssignmentResponse;
import com.ems.dto.response.ProjectResponse;
import com.ems.entity.Employee;
import com.ems.entity.Project;
import com.ems.entity.ProjectAssignment;
import com.ems.entity.ProjectAssignmentStatus;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectAssignmentRepository;
import com.ems.repository.ProjectRepository;
import com.ems.service.ProjectAssignmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectAssignmentServiceImpl implements ProjectAssignmentService {

    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public ProjectAssignmentServiceImpl(ProjectAssignmentRepository projectAssignmentRepository, 
                                        ProjectRepository projectRepository, 
                                        EmployeeRepository employeeRepository) {
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public ProjectAssignmentResponse assignEmployee(Long projectId, ProjectAssignmentCreateRequest request, String managerUsername) {
        Project project = getAuthorizedProject(projectId, managerUsername);
        
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
                
        if (employee.getUser() == null || !employee.getUser().isEnabled()) {
            throw new IllegalArgumentException("Employee is not enabled");
        }
        
        ProjectAssignment existing = projectAssignmentRepository.findByProjectIdAndEmployeeId(projectId, request.getEmployeeId())
                .orElse(null);
                
        if (existing != null) {
            if (existing.getStatus() == ProjectAssignmentStatus.ACTIVE) {
                throw new DuplicateResourceException("Employee is already assigned to this project");
            } else {
                // Re-activate assignment
                existing.setStatus(ProjectAssignmentStatus.ACTIVE);
                existing.setAssignedDate(request.getAssignedDate());
                return mapToResponse(projectAssignmentRepository.save(existing));
            }
        }
        
        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setProject(project);
        assignment.setEmployee(employee);
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setStatus(ProjectAssignmentStatus.ACTIVE);
        
        return mapToResponse(projectAssignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void removeEmployee(Long projectId, Long employeeId, String managerUsername) {
        Project project = getAuthorizedProject(projectId, managerUsername);
        
        ProjectAssignment assignment = projectAssignmentRepository.findByProjectIdAndEmployeeId(projectId, employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Project assignment not found"));
                
        assignment.setStatus(ProjectAssignmentStatus.REMOVED);
        projectAssignmentRepository.save(assignment);
    }

    @Override
    public List<ProjectAssignmentResponse> getProjectTeam(Long projectId, String managerUsername) {
        Project project = getAuthorizedProject(projectId, managerUsername);
        
        return projectAssignmentRepository.findByProjectId(projectId).stream()
                .filter(a -> a.getStatus() == ProjectAssignmentStatus.ACTIVE)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectResponse> getEmployeeProjects(String employeeUsername) {
        Employee employee = getEmployeeProfile(employeeUsername);
        
        return projectAssignmentRepository.findByEmployeeId(employee.getId()).stream()
                .filter(a -> a.getStatus() == ProjectAssignmentStatus.ACTIVE)
                .map(a -> mapToProjectResponse(a.getProject()))
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getEmployeeProjectDetails(Long projectId, String employeeUsername) {
        Employee employee = getEmployeeProfile(employeeUsername);
        
        ProjectAssignment assignment = projectAssignmentRepository.findByProjectIdAndEmployeeId(projectId, employee.getId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
                
        if (assignment.getStatus() != ProjectAssignmentStatus.ACTIVE) {
             throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        
        return mapToProjectResponse(assignment.getProject());
    }

    @Override
    public List<ProjectAssignmentResponse> getEmployeeAssignments(String employeeUsername) {
        Employee employee = getEmployeeProfile(employeeUsername);
        
        return projectAssignmentRepository.findByEmployeeId(employee.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Project getAuthorizedProject(Long projectId, String managerUsername) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                
        if (project.getManager() == null || !project.getManager().getUser().getUsername().equals(managerUsername)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to manage this project");
        }
        
        return project;
    }

    @Override
    @Transactional
    public ProjectAssignmentResponse adminAssignEmployee(Long projectId, ProjectAssignmentCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        ProjectAssignment existing = projectAssignmentRepository.findByProjectIdAndEmployeeId(projectId, request.getEmployeeId())
                .orElse(null);

        if (existing != null) {
            if (existing.getStatus() == ProjectAssignmentStatus.ACTIVE) {
                throw new DuplicateResourceException("Employee is already assigned to this project");
            } else {
                existing.setStatus(ProjectAssignmentStatus.ACTIVE);
                existing.setAssignedDate(request.getAssignedDate());
                return mapToResponse(projectAssignmentRepository.save(existing));
            }
        }

        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setProject(project);
        assignment.setEmployee(employee);
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setStatus(ProjectAssignmentStatus.ACTIVE);

        return mapToResponse(projectAssignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void adminRemoveEmployee(Long projectId, Long employeeId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        ProjectAssignment assignment = projectAssignmentRepository.findByProjectIdAndEmployeeId(projectId, employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Project assignment not found"));

        assignment.setStatus(ProjectAssignmentStatus.REMOVED);
        projectAssignmentRepository.save(assignment);
    }

    @Override
    public List<ProjectAssignmentResponse> adminGetProjectTeam(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return projectAssignmentRepository.findByProjectId(projectId).stream()
                .filter(a -> a.getStatus() == ProjectAssignmentStatus.ACTIVE)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private Employee getEmployeeProfile(String username) {
        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
    }

    private ProjectAssignmentResponse mapToResponse(ProjectAssignment assignment) {
        ProjectAssignmentResponse response = new ProjectAssignmentResponse();
        response.setId(assignment.getId());
        response.setProjectId(assignment.getProject().getId());
        response.setProjectName(assignment.getProject().getName());
        response.setEmployeeId(assignment.getEmployee().getId());
        response.setEmployeeName(assignment.getEmployee().getFirstName() + " " + assignment.getEmployee().getLastName());
        response.setAssignedDate(assignment.getAssignedDate());
        response.setStatus(assignment.getStatus().name());
        response.setCreatedAt(assignment.getCreatedAt());
        response.setUpdatedAt(assignment.getUpdatedAt());
        return response;
    }
    
    private ProjectResponse mapToProjectResponse(Project project) {
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
        return response;
    }
}
