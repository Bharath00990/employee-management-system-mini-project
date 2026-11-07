package com.ems.repository;
import com.ems.entity.LeaveRequest;
import com.ems.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.id = :employeeId AND l.status IN :statuses AND l.startDate <= :endDate AND l.endDate >= :startDate")
    long countOverlappingLeaves(@org.springframework.data.repository.query.Param("employeeId") Long employeeId, @org.springframework.data.repository.query.Param("statuses") List<LeaveStatus> statuses, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT l FROM LeaveRequest l JOIN l.employee e JOIN ProjectAssignment pa ON e.id = pa.employee.id JOIN pa.project p WHERE p.manager.id = :managerId")
    List<LeaveRequest> findLeavesForManager(@org.springframework.data.repository.query.Param("managerId") Long managerId);
}
