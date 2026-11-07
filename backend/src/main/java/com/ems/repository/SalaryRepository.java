package com.ems.repository;
import com.ems.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {
    Optional<Salary> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
    List<Salary> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);
}
