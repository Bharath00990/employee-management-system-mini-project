package com.ems.config;

import com.ems.entity.*;
import com.ems.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


 
@Component
@Order(2)
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final SalaryRepository salaryRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingAllocationRepository parkingAllocationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            ProjectRepository projectRepository,
            ProjectAssignmentRepository projectAssignmentRepository,
            SalaryRepository salaryRepository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            ParkingSlotRepository parkingSlotRepository,
            ParkingAllocationRepository parkingAllocationRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
        this.salaryRepository = salaryRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.parkingAllocationRepository = parkingAllocationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (employeeRepository.count() > 0) {
            logger.info("Demo data already exists. Skipping DataInitializer.");
            return;
        }

        logger.info("Seeding demo data for client presentation...");

        // 1. EXTRA ADMIN
        User adminUser2 = createUser("superadmin", "Admin@1234", Role.ADMIN);

        // 2. PROJECT MANAGER USERS
        User mgr1User = createUser("rajesh.kumar", "Manager@1234", Role.PROJECT_MANAGER);
        User mgr2User = createUser("priya.sharma", "Manager@1234", Role.PROJECT_MANAGER);
        User mgr3User = createUser("anand.mehta",  "Manager@1234", Role.PROJECT_MANAGER);

        // 3. EMPLOYEE USERS
        User emp1User  = createUser("arjun.patel",    "Emp@12345", Role.EMPLOYEE);
        User emp2User  = createUser("sneha.reddy",    "Emp@12345", Role.EMPLOYEE);
        User emp3User  = createUser("vikram.singh",   "Emp@12345", Role.EMPLOYEE);
        User emp4User  = createUser("divya.nair",     "Emp@12345", Role.EMPLOYEE);
        User emp5User  = createUser("rohit.gupta",    "Emp@12345", Role.EMPLOYEE);
        User emp6User  = createUser("kavya.iyer",     "Emp@12345", Role.EMPLOYEE);
        User emp7User  = createUser("manoj.joshi",    "Emp@12345", Role.EMPLOYEE);
        User emp8User  = createUser("pooja.verma",    "Emp@12345", Role.EMPLOYEE);
        User emp9User  = createUser("sanjay.tiwari",  "Emp@12345", Role.EMPLOYEE);
        User emp10User = createUser("neha.kapoor",    "Emp@12345", Role.EMPLOYEE);
        User emp11User = createUser("arun.mishra",    "Emp@12345", Role.EMPLOYEE);
        User emp12User = createUser("shruti.agarwal", "Emp@12345", Role.EMPLOYEE);

        // 4. MANAGER PROFILES
        Employee mgr1 = createEmployee(mgr1User, "MGR001", "Rajesh", "Kumar",  "rajesh.kumar@techcorp.in",   "+91-9876543210", "Engineering", "Engineering Manager", LocalDate.of(2019, 3, 15));
        Employee mgr2 = createEmployee(mgr2User, "MGR002", "Priya",  "Sharma", "priya.sharma@techcorp.in",   "+91-9876543211", "Product",     "Product Manager",     LocalDate.of(2020, 6, 1));
        Employee mgr3 = createEmployee(mgr3User, "MGR003", "Anand",  "Mehta",  "anand.mehta@techcorp.in",    "+91-9876543212", "Design & UX", "Design Manager",      LocalDate.of(2018, 11, 20));

        // 5. EMPLOYEE PROFILES
        Employee emp1  = createEmployee(emp1User,  "EMP001", "Arjun",  "Patel",   "arjun.patel@techcorp.in",    "+91-9812345001", "Engineering",   "Senior Software Engineer", LocalDate.of(2021, 1, 10));
        Employee emp2  = createEmployee(emp2User,  "EMP002", "Sneha",  "Reddy",   "sneha.reddy@techcorp.in",    "+91-9812345002", "Engineering",   "Software Engineer",        LocalDate.of(2022, 4, 5));
        Employee emp3  = createEmployee(emp3User,  "EMP003", "Vikram", "Singh",   "vikram.singh@techcorp.in",   "+91-9812345003", "Engineering",   "Full Stack Developer",     LocalDate.of(2021, 7, 20));
        Employee emp4  = createEmployee(emp4User,  "EMP004", "Divya",  "Nair",    "divya.nair@techcorp.in",     "+91-9812345004", "Product",       "Business Analyst",         LocalDate.of(2023, 2, 14));
        Employee emp5  = createEmployee(emp5User,  "EMP005", "Rohit",  "Gupta",   "rohit.gupta@techcorp.in",    "+91-9812345005", "Engineering",   "Backend Developer",        LocalDate.of(2022, 9, 1));
        Employee emp6  = createEmployee(emp6User,  "EMP006", "Kavya",  "Iyer",    "kavya.iyer@techcorp.in",     "+91-9812345006", "Design & UX",   "UI/UX Designer",           LocalDate.of(2023, 5, 15));
        Employee emp7  = createEmployee(emp7User,  "EMP007", "Manoj",  "Joshi",   "manoj.joshi@techcorp.in",    "+91-9812345007", "QA & Testing",  "QA Engineer",              LocalDate.of(2022, 1, 3));
        Employee emp8  = createEmployee(emp8User,  "EMP008", "Pooja",  "Verma",   "pooja.verma@techcorp.in",    "+91-9812345008", "DevOps",        "DevOps Engineer",          LocalDate.of(2021, 11, 22));
        Employee emp9  = createEmployee(emp9User,  "EMP009", "Sanjay", "Tiwari",  "sanjay.tiwari@techcorp.in",  "+91-9812345009", "Engineering",   "Software Engineer",        LocalDate.of(2024, 1, 8));
        Employee emp10 = createEmployee(emp10User, "EMP010", "Neha",   "Kapoor",  "neha.kapoor@techcorp.in",    "+91-9812345010", "HR & Admin",    "HR Executive",             LocalDate.of(2023, 8, 28));
        Employee emp11 = createEmployee(emp11User, "EMP011", "Arun",   "Mishra",  "arun.mishra@techcorp.in",    "+91-9812345011", "Data Science",  "Data Analyst",             LocalDate.of(2022, 6, 13));
        Employee emp12 = createEmployee(emp12User, "EMP012", "Shruti", "Agarwal", "shruti.agarwal@techcorp.in", "+91-9812345012", "Data Science",  "ML Engineer",              LocalDate.of(2023, 3, 1));

        // 6. PROJECTS — 3 COMPLETED, 3 ACTIVE, 2 PLANNED
        Project proj1 = createProject("E-Commerce Platform Revamp",
            "Complete redesign of the legacy e-commerce platform with modern React frontend and Spring Boot microservices. Includes payment gateway integration, inventory management, and analytics dashboard.",
            LocalDate.of(2024, 1, 15), LocalDate.of(2024, 8, 30), ProjectStatus.COMPLETED, mgr1);

        Project proj2 = createProject("HR Self-Service Portal",
            "Internal portal enabling employees to manage leaves, view payslips, update personal info, and request IT assets. Built with React and Spring Boot.",
            LocalDate.of(2023, 9, 1), LocalDate.of(2024, 3, 31), ProjectStatus.COMPLETED, mgr2);

        Project proj3 = createProject("Mobile App v1.0 - Customer Loyalty",
            "Cross-platform mobile application for customer loyalty rewards, gamification, and push notifications. Delivered on React Native.",
            LocalDate.of(2024, 2, 1), LocalDate.of(2024, 6, 15), ProjectStatus.COMPLETED, mgr3);

        Project proj4 = createProject("AI-Powered Analytics Dashboard",
            "Real-time business intelligence platform integrating ML models for sales forecasting, customer churn prediction, and operational metrics. Tech stack: Python, FastAPI, React, PostgreSQL.",
            LocalDate.of(2024, 7, 1), LocalDate.of(2025, 3, 31), ProjectStatus.ACTIVE, mgr1);

        Project proj5 = createProject("Cloud Migration Phase II",
            "Migration of on-premise infrastructure to AWS. Includes containerization with Docker and Kubernetes, CI/CD pipelines, and infrastructure-as-code using Terraform.",
            LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30), ProjectStatus.ACTIVE, mgr2);

        Project proj6 = createProject("Customer Data Platform",
            "Centralized customer data lake integrating CRM, marketing, and support data. Enables 360 degree customer view, segmentation, and personalized communication at scale.",
            LocalDate.of(2024, 10, 15), LocalDate.of(2025, 7, 31), ProjectStatus.ACTIVE, mgr3);

        Project proj7 = createProject("Next-Gen ERP System",
            "Enterprise Resource Planning system replacement covering finance, procurement, supply chain, and HR modules. Phased rollout planned across 3 regions.",
            LocalDate.of(2025, 2, 1), LocalDate.of(2026, 6, 30), ProjectStatus.PLANNED, mgr1);

        Project proj8 = createProject("Cybersecurity Compliance Program",
            "Organization-wide security audit, penetration testing, ISO 27001 certification, and SIEM implementation to strengthen cyber posture.",
            LocalDate.of(2025, 3, 15), LocalDate.of(2025, 12, 31), ProjectStatus.PLANNED, mgr2);

        // 7. PROJECT ASSIGNMENTS
        createAssignment(proj1, emp1,  LocalDate.of(2024, 1, 15), ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj1, emp3,  LocalDate.of(2024, 1, 15), ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj1, emp5,  LocalDate.of(2024, 1, 15), ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj1, emp7,  LocalDate.of(2024, 2, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj2, emp4,  LocalDate.of(2023, 9, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj2, emp2,  LocalDate.of(2023, 9, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj3, emp6,  LocalDate.of(2024, 2, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj3, emp7,  LocalDate.of(2024, 2, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj4, emp11, LocalDate.of(2024, 7, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj4, emp12, LocalDate.of(2024, 7, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj4, emp1,  LocalDate.of(2024, 7, 15), ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj4, emp8,  LocalDate.of(2024, 8, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj5, emp8,  LocalDate.of(2024, 9, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj5, emp5,  LocalDate.of(2024, 9, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj5, emp9,  LocalDate.of(2024, 9, 15), ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj6, emp2,  LocalDate.of(2024, 10, 15), ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj6, emp4,  LocalDate.of(2024, 10, 15), ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj6, emp6,  LocalDate.of(2024, 11, 1),  ProjectAssignmentStatus.ACTIVE);
        createAssignment(proj6, emp11, LocalDate.of(2024, 11, 1),  ProjectAssignmentStatus.ACTIVE);

        // 8. SALARIES (Jul, Aug, Sep 2026)
        int yr = 2026;
        seedSalary(mgr1,  7, yr, 180000, 18000); seedSalary(mgr1,  8, yr, 180000, 18000); seedSalary(mgr1,  9, yr, 180000, 18000);
        seedSalary(mgr2,  7, yr, 165000, 16500); seedSalary(mgr2,  8, yr, 165000, 16500); seedSalary(mgr2,  9, yr, 165000, 16500);
        seedSalary(mgr3,  7, yr, 155000, 15500); seedSalary(mgr3,  8, yr, 155000, 15500); seedSalary(mgr3,  9, yr, 155000, 15500);
        seedSalary(emp1,  7, yr, 120000, 12000); seedSalary(emp1,  8, yr, 120000, 12000); seedSalary(emp1,  9, yr, 120000, 12000);
        seedSalary(emp2,  7, yr,  85000,  8500); seedSalary(emp2,  8, yr,  85000,  8500); seedSalary(emp2,  9, yr,  85000,  8500);
        seedSalary(emp3,  7, yr,  95000,  9500); seedSalary(emp3,  8, yr,  95000,  9500); seedSalary(emp3,  9, yr,  95000,  9500);
        seedSalary(emp4,  7, yr,  75000,  7500); seedSalary(emp4,  8, yr,  75000,  7500); seedSalary(emp4,  9, yr,  75000,  7500);
        seedSalary(emp5,  7, yr,  90000,  9000); seedSalary(emp5,  8, yr,  90000,  9000); seedSalary(emp5,  9, yr,  90000,  9000);
        seedSalary(emp6,  7, yr,  80000,  8000); seedSalary(emp6,  8, yr,  80000,  8000); seedSalary(emp6,  9, yr,  80000,  8000);
        seedSalary(emp7,  7, yr,  78000,  7800); seedSalary(emp7,  8, yr,  78000,  7800); seedSalary(emp7,  9, yr,  78000,  7800);
        seedSalary(emp8,  7, yr, 115000, 11500); seedSalary(emp8,  8, yr, 115000, 11500); seedSalary(emp8,  9, yr, 115000, 11500);
        seedSalary(emp9,  7, yr,  70000,  7000); seedSalary(emp9,  8, yr,  70000,  7000); seedSalary(emp9,  9, yr,  70000,  7000);
        seedSalary(emp10, 7, yr,  65000,  6500); seedSalary(emp10, 8, yr,  65000,  6500); seedSalary(emp10, 9, yr,  65000,  6500);
        seedSalary(emp11, 7, yr,  92000,  9200); seedSalary(emp11, 8, yr,  92000,  9200); seedSalary(emp11, 9, yr,  92000,  9200);
        seedSalary(emp12, 7, yr,  98000,  9800); seedSalary(emp12, 8, yr,  98000,  9800); seedSalary(emp12, 9, yr,  98000,  9800);

        // 9. ATTENDANCE — September 2026 working days
        LocalDate[] workdays = {
            LocalDate.of(2026, 9, 1),  LocalDate.of(2026, 9, 2),  LocalDate.of(2026, 9, 3),
            LocalDate.of(2026, 9, 4),  LocalDate.of(2026, 9, 5),  LocalDate.of(2026, 9, 8),
            LocalDate.of(2026, 9, 9),  LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 11),
            LocalDate.of(2026, 9, 12), LocalDate.of(2026, 9, 15), LocalDate.of(2026, 9, 16),
            LocalDate.of(2026, 9, 17), LocalDate.of(2026, 9, 18), LocalDate.of(2026, 9, 19),
            LocalDate.of(2026, 9, 22), LocalDate.of(2026, 9, 23), LocalDate.of(2026, 9, 24),
            LocalDate.of(2026, 9, 25), LocalDate.of(2026, 9, 26)
        };

        Employee[] allEmployees = {mgr1, mgr2, mgr3, emp1, emp2, emp3, emp4, emp5, emp6, emp7, emp8, emp9, emp10, emp11, emp12};
        for (Employee emp : allEmployees) {
            for (int i = 0; i < workdays.length; i++) {
                LocalDate day = workdays[i];
                if (i == workdays.length - 1 && (emp == emp9 || emp == emp4)) {
                    createAttendance(emp, day, null, null, null, AttendanceStatus.ABSENT);
                } else {
                    createAttendance(emp, day, day.atTime(9, 0), day.atTime(18, 0), new BigDecimal("9.00"), AttendanceStatus.PRESENT);
                }
            }
        }

        // 10. LEAVE REQUESTS
        User adminUser = userRepository.findByUsername("admin").orElse(adminUser2);
        createLeave(emp2,  LeaveType.CASUAL, LocalDate.of(2026, 8, 11), LocalDate.of(2026, 8, 12), "Personal work",         LeaveStatus.APPROVED, adminUser);
        createLeave(emp3,  LeaveType.SICK,   LocalDate.of(2026, 9, 3),  LocalDate.of(2026, 9, 4),  "Fever and cold",        LeaveStatus.APPROVED, adminUser);
        createLeave(emp6,  LeaveType.EARNED, LocalDate.of(2026, 8, 18), LocalDate.of(2026, 8, 22), "Family vacation",       LeaveStatus.APPROVED, adminUser);
        createLeave(emp1,  LeaveType.CASUAL, LocalDate.of(2026, 7, 14), LocalDate.of(2026, 7, 14), "Personal appointment",  LeaveStatus.APPROVED, adminUser);
        createLeave(emp7,  LeaveType.SICK,   LocalDate.of(2026, 9, 1),  LocalDate.of(2026, 9, 2),  "Medical procedure",     LeaveStatus.APPROVED, adminUser);
        createLeave(mgr3,  LeaveType.EARNED, LocalDate.of(2026, 8, 4),  LocalDate.of(2026, 8, 8),  "Annual leave",          LeaveStatus.APPROVED, adminUser);
        createLeave(emp11, LeaveType.CASUAL, LocalDate.of(2026, 9, 8),  LocalDate.of(2026, 9, 8),  "Home maintenance",      LeaveStatus.APPROVED, adminUser);
        createLeave(emp4,  LeaveType.SICK,   LocalDate.of(2026, 9, 29), LocalDate.of(2026, 9, 30), "Not feeling well",      LeaveStatus.PENDING, null);
        createLeave(emp9,  LeaveType.CASUAL, LocalDate.of(2026, 10, 6), LocalDate.of(2026, 10, 7), "Family function",       LeaveStatus.PENDING, null);
        createLeave(emp5,  LeaveType.EARNED, LocalDate.of(2026, 10, 13),LocalDate.of(2026, 10, 17),"Diwali holiday trip",   LeaveStatus.PENDING, null);
        createLeave(emp12, LeaveType.OTHER,  LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 2), "Conference attendance", LeaveStatus.PENDING, null);
        createLeave(emp10, LeaveType.CASUAL, LocalDate.of(2026, 9, 15), LocalDate.of(2026, 9, 19), "Personal travel",       LeaveStatus.REJECTED, adminUser);
        createLeave(emp8,  LeaveType.OTHER,  LocalDate.of(2026, 9, 22), LocalDate.of(2026, 9, 26), "Extended holiday",      LeaveStatus.REJECTED, adminUser);

        // 11. PARKING SLOTS
        ParkingSlot slot1  = createParkingSlot("A-01", "Block A - Ground Floor", ParkingSlotStatus.OCCUPIED);
        ParkingSlot slot2  = createParkingSlot("A-02", "Block A - Ground Floor", ParkingSlotStatus.OCCUPIED);
        ParkingSlot slot3  = createParkingSlot("A-03", "Block A - Ground Floor", ParkingSlotStatus.OCCUPIED);
        ParkingSlot slot4  = createParkingSlot("A-04", "Block A - Ground Floor", ParkingSlotStatus.AVAILABLE);
        ParkingSlot slot5  = createParkingSlot("A-05", "Block A - Ground Floor", ParkingSlotStatus.AVAILABLE);
        ParkingSlot slot6  = createParkingSlot("B-01", "Block B - Level 1",      ParkingSlotStatus.OCCUPIED);
        ParkingSlot slot7  = createParkingSlot("B-02", "Block B - Level 1",      ParkingSlotStatus.OCCUPIED);
                             createParkingSlot("B-03", "Block B - Level 1",      ParkingSlotStatus.AVAILABLE);
                             createParkingSlot("B-04", "Block B - Level 1",      ParkingSlotStatus.AVAILABLE);
        ParkingSlot slot10 = createParkingSlot("C-01", "Block C - Basement",     ParkingSlotStatus.OCCUPIED);
        ParkingSlot slot11 = createParkingSlot("C-02", "Block C - Basement",     ParkingSlotStatus.OCCUPIED);
        ParkingSlot slot12 = createParkingSlot("C-03", "Block C - Basement",     ParkingSlotStatus.OCCUPIED);
                             createParkingSlot("C-04", "Block C - Basement",     ParkingSlotStatus.AVAILABLE);
                             createParkingSlot("C-05", "Block C - Basement",     ParkingSlotStatus.INACTIVE);
        ParkingSlot slot15 = createParkingSlot("D-01", "Block D - Open Parking", ParkingSlotStatus.AVAILABLE);

        // 12. PARKING ALLOCATIONS
        createParkingAllocation(slot1,  mgr1,  LocalDate.of(2026, 1, 10), ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot2,  mgr2,  LocalDate.of(2026, 1, 10), ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot3,  mgr3,  LocalDate.of(2026, 1, 10), ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot6,  emp1,  LocalDate.of(2026, 2, 1),  ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot7,  emp8,  LocalDate.of(2026, 3, 15), ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot10, emp3,  LocalDate.of(2026, 4, 5),  ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot11, emp5,  LocalDate.of(2026, 5, 12), ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot12, emp11, LocalDate.of(2026, 6, 20), ParkingAllocationStatus.APPROVED);
        createParkingAllocation(slot4,  emp2,  LocalDate.of(2026, 9, 20), ParkingAllocationStatus.REQUESTED);
        createParkingAllocation(slot5,  emp9,  LocalDate.of(2026, 9, 22), ParkingAllocationStatus.REQUESTED);
        createParkingAllocation(slot15, emp7,  LocalDate.of(2026, 7, 1),  ParkingAllocationStatus.RELEASED);

        logger.info("Demo data seeding complete! 15 employees, 8 projects, salaries, attendance, leaves, and parking data inserted.");
    }

    // ── Helper Methods ────────────────────────────────────────────────────────

    private User createUser(String username, String rawPassword, Role role) {
        if (userRepository.existsByUsername(username)) {
            return userRepository.findByUsername(username).orElseThrow();
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private Employee createEmployee(User user, String code, String firstName, String lastName,
                                     String email, String phone, String department,
                                     String designation, LocalDate doj) {
        Employee emp = new Employee();
        emp.setUser(user);
        emp.setEmployeeCode(code);
        emp.setFirstName(firstName);
        emp.setLastName(lastName);
        emp.setEmail(email);
        emp.setPhone(phone);
        emp.setDepartment(department);
        emp.setDesignation(designation);
        emp.setDateOfJoining(doj);
        return employeeRepository.save(emp);
    }

    private Project createProject(String name, String description, LocalDate start, LocalDate end,
                                   ProjectStatus status, Employee manager) {
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setStartDate(start);
        project.setEndDate(end);
        project.setStatus(status);
        project.setManager(manager);
        return projectRepository.save(project);
    }

    private void createAssignment(Project project, Employee employee, LocalDate assignedDate,
                                   ProjectAssignmentStatus status) {
        ProjectAssignment pa = new ProjectAssignment();
        pa.setProject(project);
        pa.setEmployee(employee);
        pa.setAssignedDate(assignedDate);
        pa.setStatus(status);
        projectAssignmentRepository.save(pa);
    }

    private void seedSalary(Employee employee, int month, int year, long basic, long deduction) {
        Salary salary = new Salary();
        salary.setEmployee(employee);
        salary.setMonth(month);
        salary.setYear(year);
        salary.setBasicSalary(new BigDecimal(basic));
        salary.setDeductions(new BigDecimal(deduction));
        salary.setNetSalary(new BigDecimal(basic - deduction));
        salaryRepository.save(salary);
    }

    private void createAttendance(Employee employee, LocalDate date, LocalDateTime checkIn,
                                   LocalDateTime checkOut, BigDecimal totalHours,
                                   AttendanceStatus status) {
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(date);
        attendance.setCheckIn(checkIn);
        attendance.setCheckOut(checkOut);
        attendance.setTotalHours(totalHours);
        attendance.setStatus(status);
        attendance.setWorkMode(WorkMode.OFFICE);
        attendanceRepository.save(attendance);
    }

    private void createLeave(Employee employee, LeaveType leaveType, LocalDate start, LocalDate end,
                              String reason, LeaveStatus status, User approvedBy) {
        LeaveRequest lr = new LeaveRequest();
        lr.setEmployee(employee);
        lr.setLeaveType(leaveType);
        lr.setStartDate(start);
        lr.setEndDate(end);
        lr.setReason(reason);
        lr.setStatus(status);
        lr.setApprovedBy(approvedBy);
        leaveRequestRepository.save(lr);
    }

    private ParkingSlot createParkingSlot(String slotNumber, String location, ParkingSlotStatus status) {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(slotNumber);
        slot.setLocation(location);
        slot.setStatus(status);
        return parkingSlotRepository.save(slot);
    }

    private void createParkingAllocation(ParkingSlot slot, Employee employee, LocalDate allocatedDate,
                                          ParkingAllocationStatus status) {
        ParkingAllocation pa = new ParkingAllocation();
        pa.setParkingSlot(slot);
        pa.setEmployee(employee);
        pa.setAllocatedDate(allocatedDate);
        pa.setStatus(status);
        parkingAllocationRepository.save(pa);
    }
}
