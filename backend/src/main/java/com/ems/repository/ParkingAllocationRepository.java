package com.ems.repository;
import com.ems.entity.ParkingAllocation;
import com.ems.entity.ParkingAllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingAllocationRepository extends JpaRepository<ParkingAllocation, Long> {
    List<ParkingAllocation> findByEmployeeId(Long employeeId);
    List<ParkingAllocation> findByParkingSlotId(Long parkingSlotId);
    List<ParkingAllocation> findByStatus(ParkingAllocationStatus status);
    boolean existsByEmployeeIdAndStatus(Long employeeId, ParkingAllocationStatus status);
    boolean existsByParkingSlotIdAndStatus(Long parkingSlotId, ParkingAllocationStatus status);
}
