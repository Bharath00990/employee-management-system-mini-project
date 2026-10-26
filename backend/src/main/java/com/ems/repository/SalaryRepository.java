package com.ems.repository;

import com.ems.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {
    List<Salary> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);
    Optional<Salary> findByEmployeeIdAndMonthAndYear(Long employeeId, String month, Integer year);
    List<Salary> findByMonthAndYear(String month, Integer year);

    @Query("SELECT SUM(s.netPay) FROM Salary s WHERE s.month = :month AND s.year = :year")
    Double sumNetPayByMonthAndYear(@Param("month") String month, @Param("year") Integer year);

    @Query("SELECT SUM(s.netPay) FROM Salary s")
    Double sumTotalPayroll();
}
