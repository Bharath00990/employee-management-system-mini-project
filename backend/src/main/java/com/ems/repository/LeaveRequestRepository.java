package com.ems.repository;

import com.ems.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(String status);
    Long countByStatus(String status);

    @Query("SELECT l FROM LeaveRequest l WHERE " +
           "(cast(:status as string) IS NULL OR :status = '' OR l.status = :status) " +
           "ORDER BY l.createdAt DESC")
    List<LeaveRequest> filterLeaves(@Param("status") String status);
}
