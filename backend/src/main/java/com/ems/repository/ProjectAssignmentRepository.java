package com.ems.repository;
import com.ems.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {
    List<ProjectAssignment> findByProjectId(Long projectId);
    List<ProjectAssignment> findByEmployeeId(Long employeeId);
    Optional<ProjectAssignment> findByProjectIdAndEmployeeId(Long projectId, Long employeeId);
    boolean existsByProjectIdAndEmployeeId(Long projectId, Long employeeId);
}
