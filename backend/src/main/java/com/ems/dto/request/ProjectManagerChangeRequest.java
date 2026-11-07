package com.ems.dto.request;

import jakarta.validation.constraints.NotNull;

public class ProjectManagerChangeRequest {
    @NotNull(message = "Manager ID is required")
    private Long managerId;

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
}
