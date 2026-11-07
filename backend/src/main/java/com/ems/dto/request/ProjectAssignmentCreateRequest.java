package com.ems.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ProjectAssignmentCreateRequest {
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    @NotNull(message = "Assigned date is required field mandatory")
    private LocalDate assignedDate;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }
}
