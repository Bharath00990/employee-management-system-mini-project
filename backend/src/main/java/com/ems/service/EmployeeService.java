package com.ems.service;

import com.ems.dto.request.CreateEmployeeRequest;
import com.ems.dto.request.ProjectManagerRequest;
import com.ems.dto.request.UpdateEmployeeRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.UserResponse;
import java.util.List;

import com.ems.dto.request.CreateEmployeeProfileRequest;

public interface EmployeeService {
    EmployeeResponse createEmployee(CreateEmployeeRequest request);
    EmployeeResponse createProjectManager(CreateEmployeeRequest request);
    EmployeeResponse attachEmployeeProfileToProjectManager(Long userId, CreateEmployeeProfileRequest request);
    List<EmployeeResponse> getAllEmployees();
    EmployeeResponse getEmployeeById(Long id);
    EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request);
}
