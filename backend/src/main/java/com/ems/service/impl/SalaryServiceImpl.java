package com.ems.service.impl;

import com.ems.dto.request.CreateSalaryRequest;
import com.ems.dto.request.UpdateSalaryRequest;
import com.ems.dto.response.SalaryResponse;
import com.ems.entity.Employee;
import com.ems.entity.Salary;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.SalaryRepository;
import com.ems.service.SalaryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalaryServiceImpl implements SalaryService {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;

    public SalaryServiceImpl(SalaryRepository salaryRepository, EmployeeRepository employeeRepository) {
        this.salaryRepository = salaryRepository;
        this.employeeRepository = employeeRepository;
    }

    private SalaryResponse mapToResponse(Salary salary) {
        SalaryResponse response = new SalaryResponse();
        response.setSalaryId(salary.getId());
        response.setEmployeeId(salary.getEmployee().getId());
        response.setEmployeeCode(salary.getEmployee().getEmployeeCode());
        response.setEmployeeName(salary.getEmployee().getFirstName() + " " + salary.getEmployee().getLastName());
        response.setMonth(salary.getMonth());
        response.setYear(salary.getYear());
        response.setBasicSalary(salary.getBasicSalary());
        response.setDeductions(salary.getDeductions());
        response.setNetSalary(salary.getNetSalary());
        response.setCreatedAt(salary.getCreatedAt());
        response.setUpdatedAt(salary.getUpdatedAt());
        return response;
    }

    @Override
    @Transactional
    public SalaryResponse createSalary(CreateSalaryRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (salaryRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), request.getMonth(), request.getYear()).isPresent()) {
            throw new DuplicateResourceException("Salary record already exists for this employee in the specified month and year");
        }

        Salary salary = new Salary();
        salary.setEmployee(employee);
        salary.setMonth(request.getMonth());
        salary.setYear(request.getYear());
        salary.setBasicSalary(request.getBasicSalary());
        salary.setDeductions(request.getDeductions());
        salary.setNetSalary(request.getBasicSalary().subtract(request.getDeductions()));

        Salary saved = salaryRepository.save(salary);
        return mapToResponse(saved);
    }

    @Override
    public List<SalaryResponse> getAllSalaries() {
        return salaryRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<SalaryResponse> getEmployeeSalaries(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found");
        }
        
        List<Salary> salaries = salaryRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
        if (salaries.isEmpty()) {
            throw new ResourceNotFoundException("No salary records found for this employee");
        }
        
        return salaries.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public SalaryResponse getSalary(Long salaryId) {
        Salary salary = salaryRepository.findById(salaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary not found"));
        return mapToResponse(salary);
    }

    @Override
    @Transactional
    public SalaryResponse updateSalary(Long salaryId, UpdateSalaryRequest request) {
        Salary salary = salaryRepository.findById(salaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary not found"));

        salary.setBasicSalary(request.getBasicSalary());
        salary.setDeductions(request.getDeductions());
        salary.setNetSalary(request.getBasicSalary().subtract(request.getDeductions()));

        Salary saved = salaryRepository.save(salary);
        return mapToResponse(saved);
    }

    @Override
    public List<SalaryResponse> getMySalaries(String username) {
        Employee employee = employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for username"));

        List<Salary> salaries = salaryRepository.findByEmployeeIdOrderByYearDescMonthDesc(employee.getId());
        if (salaries.isEmpty()) {
            throw new ResourceNotFoundException("No salary records found");
        }
        
        return salaries.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
}
