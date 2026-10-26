package com.ems.repository;

import com.ems.entity.ParkingAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingAllocationRepository extends JpaRepository<ParkingAllocation, Long> {
    List<ParkingAllocation> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    Optional<ParkingAllocation> findByEmployeeIdAndStatus(Long employeeId, String status);
    List<ParkingAllocation> findByStatus(String status);
}
