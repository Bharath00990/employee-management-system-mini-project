package com.ems.repository;
import com.ems.entity.ParkingSlot;
import com.ems.entity.ParkingSlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    Optional<ParkingSlot> findBySlotNumber(String slotNumber);
    boolean existsBySlotNumber(String slotNumber);
    List<ParkingSlot> findByStatus(ParkingSlotStatus status);
}
