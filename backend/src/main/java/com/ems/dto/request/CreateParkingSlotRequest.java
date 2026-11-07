package com.ems.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateParkingSlotRequest {

    @NotBlank(message = "Slot number is required")
    private String slotNumber;

    private String location;

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
