package com.ems.service.impl;

import com.ems.dto.request.CreateParkingAllocationRequest;
import com.ems.dto.request.CreateParkingSlotRequest;
import com.ems.dto.response.ParkingAllocationResponse;
import com.ems.dto.response.ParkingSlotResponse;
import com.ems.entity.Employee;
import com.ems.entity.ParkingAllocation;
import com.ems.entity.ParkingAllocationStatus;
import com.ems.entity.ParkingSlot;
import com.ems.entity.ParkingSlotStatus;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ParkingAllocationRepository;
import com.ems.repository.ParkingSlotRepository;
import com.ems.service.ParkingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingServiceImpl implements ParkingService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingAllocationRepository parkingAllocationRepository;
    private final EmployeeRepository employeeRepository;

    public ParkingServiceImpl(ParkingSlotRepository parkingSlotRepository, 
                              ParkingAllocationRepository parkingAllocationRepository, 
                              EmployeeRepository employeeRepository) {
        this.parkingSlotRepository = parkingSlotRepository;
        this.parkingAllocationRepository = parkingAllocationRepository;
        this.employeeRepository = employeeRepository;
    }

    private ParkingSlotResponse mapToSlotResponse(ParkingSlot slot) {
        ParkingSlotResponse response = new ParkingSlotResponse();
        response.setId(slot.getId());
        response.setSlotNumber(slot.getSlotNumber());
        response.setLocation(slot.getLocation());
        response.setStatus(slot.getStatus());
        response.setCreatedAt(slot.getCreatedAt());
        response.setUpdatedAt(slot.getUpdatedAt());
        return response;
    }

    private ParkingAllocationResponse mapToAllocationResponse(ParkingAllocation allocation) {
        ParkingAllocationResponse response = new ParkingAllocationResponse();
        response.setAllocationId(allocation.getId());
        response.setParkingSlotId(allocation.getParkingSlot().getId());
        response.setSlotNumber(allocation.getParkingSlot().getSlotNumber());
        response.setLocation(allocation.getParkingSlot().getLocation());
        response.setEmployeeId(allocation.getEmployee().getId());
        response.setEmployeeName(allocation.getEmployee().getFirstName() + " " + allocation.getEmployee().getLastName());
        response.setAllocatedDate(allocation.getAllocatedDate());
        response.setStatus(allocation.getStatus());
        response.setCreatedAt(allocation.getCreatedAt());
        response.setUpdatedAt(allocation.getUpdatedAt());
        return response;
    }

    @Override
    @Transactional
    public ParkingSlotResponse createSlot(CreateParkingSlotRequest request) {
        if (parkingSlotRepository.existsBySlotNumber(request.getSlotNumber())) {
            throw new DuplicateResourceException("Parking slot with number " + request.getSlotNumber() + " already exists");
        }

        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(request.getSlotNumber());
        slot.setLocation(request.getLocation());
        slot.setStatus(ParkingSlotStatus.AVAILABLE);

        ParkingSlot saved = parkingSlotRepository.save(slot);
        return mapToSlotResponse(saved);
    }

    @Override
    public List<ParkingSlotResponse> getAllSlots() {
        return parkingSlotRepository.findAll().stream()
                .map(this::mapToSlotResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ParkingSlotResponse getSlot(Long slotId) {
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found"));
        return mapToSlotResponse(slot);
    }

    @Override
    @Transactional
    public ParkingAllocationResponse allocateSlot(CreateParkingAllocationRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        ParkingSlot slot = parkingSlotRepository.findById(request.getParkingSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found"));

        if (slot.getStatus() != ParkingSlotStatus.AVAILABLE) {
            throw new DuplicateResourceException("Parking slot is already occupied or inactive");
        }

        if (parkingAllocationRepository.existsByEmployeeIdAndStatus(employee.getId(), ParkingAllocationStatus.APPROVED)) {
            throw new DuplicateResourceException("Employee already has an active parking allocation");
        }

        if (parkingAllocationRepository.existsByParkingSlotIdAndStatus(slot.getId(), ParkingAllocationStatus.APPROVED)) {
            throw new DuplicateResourceException("Parking slot is already allocated");
        }

        slot.setStatus(ParkingSlotStatus.OCCUPIED);
        parkingSlotRepository.save(slot);

        ParkingAllocation allocation = new ParkingAllocation();
        allocation.setEmployee(employee);
        allocation.setParkingSlot(slot);
        allocation.setAllocatedDate(LocalDate.now());
        allocation.setStatus(ParkingAllocationStatus.APPROVED);

        ParkingAllocation saved = parkingAllocationRepository.save(allocation);
        return mapToAllocationResponse(saved);
    }

    @Override
    @Transactional
    public ParkingAllocationResponse releaseAllocation(Long allocationId) {
        ParkingAllocation allocation = parkingAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking allocation not found"));

        if (allocation.getStatus() == ParkingAllocationStatus.RELEASED) {
            throw new DuplicateResourceException("Parking allocation is already released");
        }

        allocation.setStatus(ParkingAllocationStatus.RELEASED);
        parkingAllocationRepository.save(allocation);

        ParkingSlot slot = allocation.getParkingSlot();
        slot.setStatus(ParkingSlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);

        return mapToAllocationResponse(allocation);
    }

    @Override
    public List<ParkingAllocationResponse> getAllAllocations() {
        return parkingAllocationRepository.findAll().stream()
                .map(this::mapToAllocationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ParkingAllocationResponse getAllocation(Long allocationId) {
        ParkingAllocation allocation = parkingAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking allocation not found"));
        return mapToAllocationResponse(allocation);
    }

    @Override
    public List<ParkingAllocationResponse> getMyAllocations(String username) {
        Employee employee = employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        List<ParkingAllocation> allocations = parkingAllocationRepository.findByEmployeeId(employee.getId());
        if (allocations.isEmpty()) {
            throw new ResourceNotFoundException("No parking allocations found for the current user");
        }

        return allocations.stream()
                .filter(a -> a.getStatus() == ParkingAllocationStatus.APPROVED)
                .map(this::mapToAllocationResponse)
                .collect(Collectors.toList());
    }
}
