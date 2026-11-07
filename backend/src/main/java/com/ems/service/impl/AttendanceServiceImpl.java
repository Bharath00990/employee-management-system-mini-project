package com.ems.service.impl;

import com.ems.dto.request.AddBreakRequest;
import com.ems.dto.request.CreateAttendanceRequest;
import com.ems.dto.request.UpdateAttendanceStatusRequest;
import com.ems.dto.response.AttendanceBreakResponse;
import com.ems.dto.response.AttendanceResponse;
import com.ems.entity.Attendance;
import com.ems.entity.AttendanceBreak;
import com.ems.entity.BreakType;
import com.ems.entity.Employee;
import com.ems.entity.Project;
import com.ems.entity.ProjectAssignment;
import com.ems.entity.ProjectAssignmentStatus;
import com.ems.entity.WorkMode;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.AttendanceBreakRepository;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ProjectAssignmentRepository;
import com.ems.repository.ProjectRepository;
import com.ems.service.AttendanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceBreakRepository attendanceBreakRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 AttendanceBreakRepository attendanceBreakRepository,
                                 EmployeeRepository employeeRepository,
                                 ProjectRepository projectRepository,
                                 ProjectAssignmentRepository projectAssignmentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.attendanceBreakRepository = attendanceBreakRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
    }

    @Override
    @Transactional
    public AttendanceResponse markAttendance(String username, CreateAttendanceRequest request) {
        if (request.getDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot mark attendance for a future date");
        }

        Employee employee = getEmployeeByUsername(username);

        if (attendanceRepository.existsByEmployeeIdAndDate(employee.getId(), request.getDate())) {
            throw new DuplicateResourceException("Attendance already exists for this employee on this date");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(request.getDate());
        attendance.setStatus(request.getStatus());

        if (request.getWorkMode() != null) {
            attendance.setWorkMode(request.getWorkMode());
        }

        if (request.getCheckIn() != null) {
            attendance.setCheckIn(request.getCheckIn());
        }
        if (request.getCheckOut() != null) {
            attendance.setCheckOut(request.getCheckOut());
            if (attendance.getCheckIn() != null) {
                Duration duration = Duration.between(attendance.getCheckIn(), attendance.getCheckOut());
                long seconds = Math.max(0, duration.getSeconds());
                attendance.setTotalHours(BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP));
            }
        }

        if (request.getBreaks() != null && !request.getBreaks().isEmpty()) {
            for (AddBreakRequest bReq : request.getBreaks()) {
                AttendanceBreak brk = new AttendanceBreak();
                brk.setAttendance(attendance);
                brk.setBreakType(bReq.getBreakType());
                brk.setStartTime(bReq.getStartTime());
                brk.setEndTime(bReq.getEndTime());
                int mins = (int) Duration.between(bReq.getStartTime(), bReq.getEndTime()).toMinutes();
                if (mins < 0) mins += 24 * 60;
                brk.setDurationMinutes(mins);
                brk.setNotes(bReq.getNotes());
                attendance.addBreak(brk);
            }
        }

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponse checkIn(String username) {
        return checkIn(username, WorkMode.OFFICE);
    }

    @Override
    @Transactional
    public AttendanceResponse checkIn(String username, WorkMode workMode) {
        Employee employee = getEmployeeByUsername(username);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElse(null);

        if (attendance != null && attendance.getCheckIn() != null) {
            String time = attendance.getCheckIn().toLocalTime().truncatedTo(ChronoUnit.MINUTES).toString();
            throw new IllegalStateException("You have already checked in today at " + time);
        }

        if (attendance == null) {
            attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setDate(today);
            attendance.setStatus(com.ems.entity.AttendanceStatus.PRESENT);
        }

        if (workMode != null) {
            attendance.setWorkMode(workMode);
        }

        attendance.setCheckIn(LocalDateTime.now());
        if (attendance.getStatus() == null || attendance.getStatus() == com.ems.entity.AttendanceStatus.ABSENT) {
            attendance.setStatus(com.ems.entity.AttendanceStatus.PRESENT);
        }

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponse updateWorkMode(String username, WorkMode workMode) {
        Employee employee = getEmployeeByUsername(username);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseGet(() -> {
                    Attendance newAtt = new Attendance();
                    newAtt.setEmployee(employee);
                    newAtt.setDate(today);
                    newAtt.setStatus(com.ems.entity.AttendanceStatus.PRESENT);
                    return newAtt;
                });

        attendance.setWorkMode(workMode != null ? workMode : WorkMode.OFFICE);
        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponse addBreak(String username, AddBreakRequest request) {
        Employee employee = getEmployeeByUsername(username);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseGet(() -> {
                    Attendance newAtt = new Attendance();
                    newAtt.setEmployee(employee);
                    newAtt.setDate(today);
                    newAtt.setStatus(com.ems.entity.AttendanceStatus.PRESENT);
                    newAtt.setWorkMode(WorkMode.WORK_FROM_HOME);
                    return attendanceRepository.save(newAtt);
                });

        int duration = (int) Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (duration < 0) {
            duration += 24 * 60;
        }

        AttendanceBreak brk = new AttendanceBreak();
        brk.setAttendance(attendance);
        brk.setBreakType(request.getBreakType());
        brk.setStartTime(request.getStartTime());
        brk.setEndTime(request.getEndTime());
        brk.setDurationMinutes(duration);
        brk.setNotes(request.getNotes());

        attendance.addBreak(brk);
        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponse removeBreak(String username, Long breakId) {
        Employee employee = getEmployeeByUsername(username);
        AttendanceBreak brk = attendanceBreakRepository.findById(breakId)
                .orElseThrow(() -> new ResourceNotFoundException("Break not found"));

        Attendance attendance = brk.getAttendance();
        if (!attendance.getEmployee().getId().equals(employee.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to delete this break");
        }

        attendance.removeBreak(brk);
        attendanceBreakRepository.delete(brk);
        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponse checkOut(String username) {
        Employee employee = getEmployeeByUsername(username);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new IllegalStateException("Cannot check out without checking in first for today"));

        if (attendance.getCheckIn() == null) {
            throw new IllegalStateException("Cannot check out without checking in first");
        }

        if (attendance.getCheckOut() != null) {
            String time = attendance.getCheckOut().toLocalTime().truncatedTo(ChronoUnit.MINUTES).toString();
            throw new IllegalStateException("You have already checked out today at " + time);
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        attendance.setCheckOut(checkOutTime);

        Duration duration = Duration.between(attendance.getCheckIn(), checkOutTime);
        long seconds = Math.max(0, duration.getSeconds());
        BigDecimal hours = BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
        attendance.setTotalHours(hours);

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceResponse getTodayAttendance(String username) {
        Employee employee = getEmployeeByUsername(username);
        LocalDate today = LocalDate.now();
        return attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    public List<AttendanceResponse> getMyAttendance(String username) {
        Employee employee = getEmployeeByUsername(username);
        return attendanceRepository.findByEmployeeId(employee.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttendanceResponse getMyAttendanceByDate(String username, LocalDate date) {
        Employee employee = getEmployeeByUsername(username);
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), date)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found for this date"));
        return mapToResponse(attendance);
    }

    @Override
    public List<AttendanceResponse> getManagerTeamAttendance(String managerUsername) {
        List<Long> teamEmployeeIds = getTeamEmployeeIds(managerUsername);
        if (teamEmployeeIds.isEmpty()) return List.of();
        
        return attendanceRepository.findByEmployeeIdIn(teamEmployeeIds).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getManagerTeamAttendanceByDate(String managerUsername, LocalDate date) {
        List<Long> teamEmployeeIds = getTeamEmployeeIds(managerUsername);
        if (teamEmployeeIds.isEmpty()) return List.of();
        
        return attendanceRepository.findByEmployeeIdInAndDate(teamEmployeeIds, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceResponse> getEmployeeAttendance(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found");
        }
        return attendanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttendanceResponse getEmployeeAttendanceByDate(Long employeeId, LocalDate date) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found");
        }
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, date)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found for this date"));
        return mapToResponse(attendance);
    }

    @Override
    @Transactional
    public AttendanceResponse updateAttendanceStatus(Long attendanceId, UpdateAttendanceStatusRequest request) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
        attendance.setStatus(request.getStatus());
        return mapToResponse(attendanceRepository.save(attendance));
    }

    private Employee getEmployeeByUsername(String username) {
        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
    }

    private List<Long> getTeamEmployeeIds(String managerUsername) {
        Employee manager = getEmployeeByUsername(managerUsername);
        List<Project> projects = projectRepository.findByManagerId(manager.getId());
        
        return projects.stream()
                .flatMap(project -> projectAssignmentRepository.findByProjectId(project.getId()).stream())
                .filter(assignment -> assignment.getStatus() == ProjectAssignmentStatus.ACTIVE)
                .map(assignment -> assignment.getEmployee().getId())
                .distinct()
                .collect(Collectors.toList());
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        response.setEmployeeId(attendance.getEmployee().getId());
        response.setEmployeeName(attendance.getEmployee().getFirstName() + " " + attendance.getEmployee().getLastName());
        response.setEmployeeCode(attendance.getEmployee().getEmployeeCode());
        response.setDate(attendance.getDate());
        response.setStatus(attendance.getStatus().name());
        response.setCheckIn(attendance.getCheckIn());
        response.setCheckOut(attendance.getCheckOut());
        response.setTotalHours(attendance.getTotalHours());

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        if (attendance.getCheckIn() != null) {
            response.setCheckInTime(attendance.getCheckIn().format(timeFormatter));
        }
        if (attendance.getCheckOut() != null) {
            response.setCheckOutTime(attendance.getCheckOut().format(timeFormatter));
        }

        response.setWorkMode(attendance.getWorkMode() != null ? attendance.getWorkMode().name() : "OFFICE");

        int totalBreakMins = 0;
        if (attendance.getBreaks() != null && !attendance.getBreaks().isEmpty()) {
            List<AttendanceBreakResponse> breakResponses = new java.util.ArrayList<>();
            for (AttendanceBreak brk : attendance.getBreaks()) {
                AttendanceBreakResponse bRes = new AttendanceBreakResponse();
                bRes.setId(brk.getId());
                bRes.setBreakType(brk.getBreakType().name());
                bRes.setBreakTypeLabel(formatBreakTypeLabel(brk.getBreakType()));
                bRes.setStartTime(brk.getStartTime());
                bRes.setEndTime(brk.getEndTime());
                if (brk.getStartTime() != null) {
                    bRes.setFormattedStartTime(brk.getStartTime().format(timeFormatter));
                }
                if (brk.getEndTime() != null) {
                    bRes.setFormattedEndTime(brk.getEndTime().format(timeFormatter));
                }
                bRes.setDurationMinutes(brk.getDurationMinutes());
                bRes.setNotes(brk.getNotes());
                if (brk.getDurationMinutes() != null) {
                    totalBreakMins += brk.getDurationMinutes();
                }
                breakResponses.add(bRes);
            }
            response.setBreaks(breakResponses);
        }
        response.setTotalBreakMinutes(totalBreakMins);

        response.setCreatedAt(attendance.getCreatedAt());
        response.setUpdatedAt(attendance.getUpdatedAt());
        return response;
    }

    private String formatBreakTypeLabel(BreakType type) {
        if (type == null) return "Break";
        return switch (type) {
            case LUNCH -> "Lunch Break";
            case BREAKFAST -> "Breakfast Break";
            case SNACKS -> "Snacks Break";
            case TEA_COFFEE -> "Tea / Coffee Break";
            case OTHER -> "Other Break";
        };
    }
}
