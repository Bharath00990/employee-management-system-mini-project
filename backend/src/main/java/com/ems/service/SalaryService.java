package com.ems.service;

import com.ems.dto.request.CreateSalaryRequest;
import com.ems.dto.request.UpdateSalaryRequest;
import com.ems.dto.response.SalaryResponse;

import java.util.List;

public interface SalaryService {
    
    // Admin
    SalaryResponse createSalary(CreateSalaryRequest request);
    List<SalaryResponse> getAllSalaries();
    List<SalaryResponse> getEmployeeSalaries(Long employeeId);
    SalaryResponse getSalary(Long salaryId);
    SalaryResponse updateSalary(Long salaryId, UpdateSalaryRequest request);

    // Employee
    List<SalaryResponse> getMySalaries(String username);
}
