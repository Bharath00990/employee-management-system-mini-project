package com.ems.dto.request;

import com.ems.entity.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public class ProjectStatusRequest {
    @NotNull(message = "Status is required")
    private ProjectStatus status;

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
}
