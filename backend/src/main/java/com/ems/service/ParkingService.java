package com.ems.service;

import com.ems.dto.request.CreateParkingAllocationRequest;
import com.ems.dto.request.CreateParkingSlotRequest;
import com.ems.dto.response.ParkingAllocationResponse;
import com.ems.dto.response.ParkingSlotResponse;

import java.util.List;

public interface ParkingService {
    
    // Slot Management (Admin)
    ParkingSlotResponse createSlot(CreateParkingSlotRequest request);
    List<ParkingSlotResponse> getAllSlots();
    ParkingSlotResponse getSlot(Long slotId);

    // Allocation Management (Admin)
    ParkingAllocationResponse allocateSlot(CreateParkingAllocationRequest request);
    ParkingAllocationResponse releaseAllocation(Long allocationId);
    List<ParkingAllocationResponse> getAllAllocations();
    ParkingAllocationResponse getAllocation(Long allocationId);

    // Employee / Manager 
    List<ParkingAllocationResponse> getMyAllocations(String username);
}
