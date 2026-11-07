package com.ems.dto.request;

import com.ems.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateAttendanceStatusRequest {

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
}
