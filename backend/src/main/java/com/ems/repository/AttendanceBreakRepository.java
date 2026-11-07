package com.ems.repository;

import com.ems.entity.AttendanceBreak;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceBreakRepository extends JpaRepository<AttendanceBreak, Long> {
    List<AttendanceBreak> findByAttendanceId(Long attendanceId);
}
