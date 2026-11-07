package com.ems.dto.request;

import com.ems.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateAttendanceRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    private java.time.LocalDateTime checkIn;

    private java.time.LocalDateTime checkOut;

    private com.ems.entity.WorkMode workMode;

    private java.util.List<AddBreakRequest> breaks;

    public com.ems.entity.WorkMode getWorkMode() {
        return workMode;
    }

    public void setWorkMode(com.ems.entity.WorkMode workMode) {
        this.workMode = workMode;
    }

    public java.util.List<AddBreakRequest> getBreaks() {
        return breaks;
    }

    public void setBreaks(java.util.List<AddBreakRequest> breaks) {
        this.breaks = breaks;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public java.time.LocalDateTime getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(java.time.LocalDateTime checkIn) {
        this.checkIn = checkIn;
    }

    public java.time.LocalDateTime getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(java.time.LocalDateTime checkOut) {
        this.checkOut = checkOut;
    }
}
