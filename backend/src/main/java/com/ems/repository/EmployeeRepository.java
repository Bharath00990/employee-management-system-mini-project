package com.ems.repository;

import com.ems.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUserId(Long userId);
    Boolean existsByEmployeeId(String employeeId);
    Boolean existsByEmail(String email);

    List<Employee> findByDepartment(String department);
    List<Employee> findByStatus(String status);

    @Query("SELECT e FROM Employee e WHERE " +
           "(cast(:search as string) IS NULL OR :search = '' OR " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR " +
           "LOWER(e.employeeId) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) AND " +
           "(cast(:dept as string) IS NULL OR :dept = '' OR e.department = :dept) AND " +
           "(cast(:status as string) IS NULL OR :status = '' OR e.status = :status)")
    List<Employee> searchEmployees(@Param("search") String search, 
                                  @Param("dept") String department, 
                                  @Param("status") String status);
}
