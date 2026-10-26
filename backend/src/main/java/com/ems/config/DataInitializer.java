package com.ems.config;

import com.ems.entity.*;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SalaryRepository salaryRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingAllocationRepository parkingAllocationRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            log.info("Initializing Roles into PostgreSQL...");
            roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).build());
            roleRepository.save(Role.builder().name(ERole.ROLE_MANAGER).build());
            roleRepository.save(Role.builder().name(ERole.ROLE_EMPLOYEE).build());
        }

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow();
        Role managerRole = roleRepository.findByName(ERole.ROLE_MANAGER).orElseThrow();
        Role employeeRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE).orElseThrow();

        if (userRepository.count() == 0) {
            log.info("Initializing Seed Users, Employees, Projects, and Data into PostgreSQL...");

            // 1. Admin User & Employee
            User adminUser = userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@ems.com")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(Set.of(adminRole))
                    .active(true)
                    .build());

            Employee adminEmp = employeeRepository.save(Employee.builder()
                    .employeeId("EMP-0001")
                    .firstName("Alexander")
                    .lastName("Pierce")
                    .email("admin@ems.com")
                    .phone("+1 555-0100")
                    .department("Executive Management")
                    .designation("System Administrator")
                    .joiningDate(LocalDate.of(2023, 1, 15))
                    .salary(125000.0)
                    .status("ACTIVE")
                    .user(adminUser)
                    .build());

            // 2. Managers
            User manager1User = userRepository.save(User.builder()
                    .username("manager1")
                    .email("sarah.connor@ems.com")
                    .password(passwordEncoder.encode("manager123"))
                    .roles(Set.of(managerRole))
                    .active(true)
                    .build());

            Employee mgr1 = employeeRepository.save(Employee.builder()
                    .employeeId("EMP-0002")
                    .firstName("Sarah")
                    .lastName("Connor")
                    .email("sarah.connor@ems.com")
                    .phone("+1 555-0101")
                    .department("Engineering")
                    .designation("Engineering Lead & PM")
                    .joiningDate(LocalDate.of(2023, 3, 1))
                    .salary(95000.0)
                    .status("ACTIVE")
                    .user(manager1User)
                    .build());

            User manager2User = userRepository.save(User.builder()
                    .username("manager2")
                    .email("david.miller@ems.com")
                    .password(passwordEncoder.encode("manager123"))
                    .roles(Set.of(managerRole))
                    .active(true)
                    .build());

            Employee mgr2 = employeeRepository.save(Employee.builder()
                    .employeeId("EMP-0003")
                    .firstName("David")
                    .lastName("Miller")
                    .email("david.miller@ems.com")
                    .phone("+1 555-0102")
                    .department("Product & Design")
                    .designation("Product Manager")
                    .joiningDate(LocalDate.of(2023, 4, 10))
                    .salary(92000.0)
                    .status("ACTIVE")
                    .user(manager2User)
                    .build());

            // 3. Regular Employees (10 Employees)
            String[][] employeeData = {
                {"EMP-1001", "John", "Doe", "john.doe@ems.com", "+1 555-0111", "Engineering", "Senior Full-Stack Engineer", "75000"},
                {"EMP-1002", "Jane", "Smith", "jane.smith@ems.com", "+1 555-0112", "Engineering", "Backend Java Developer", "68000"},
                {"EMP-1003", "Michael", "Brown", "michael.brown@ems.com", "+1 555-0113", "Engineering", "Frontend React Developer", "65000"},
                {"EMP-1004", "Emily", "Davis", "emily.davis@ems.com", "+1 555-0114", "Product & Design", "UI/UX Designer", "62000"},
                {"EMP-1005", "Daniel", "Wilson", "daniel.wilson@ems.com", "+1 555-0115", "QA & Testing", "QA Automation Engineer", "58000"},
                {"EMP-1006", "Olivia", "Taylor", "olivia.taylor@ems.com", "+1 555-0116", "Human Resources", "HR Specialist", "52000"},
                {"EMP-1007", "James", "Anderson", "james.anderson@ems.com", "+1 555-0117", "Finance", "Financial Analyst", "60000"},
                {"EMP-1008", "Sophia", "Thomas", "sophia.thomas@ems.com", "+1 555-0118", "Marketing", "Marketing Specialist", "55000"},
                {"EMP-1009", "Robert", "Jackson", "robert.jackson@ems.com", "+1 555-0119", "Engineering", "DevOps Engineer", "72000"},
                {"EMP-1010", "Emma", "White", "emma.white@ems.com", "+1 555-0120", "Engineering", "Data Analyst", "64000"}
            };

            List<Employee> createdEmployees = new java.util.ArrayList<>();
            int idx = 1;
            for (String[] data : employeeData) {
                String username = "emp" + idx;
                User empUser = userRepository.save(User.builder()
                        .username(username)
                        .email(data[3])
                        .password(passwordEncoder.encode("emp123"))
                        .roles(Set.of(employeeRole))
                        .active(true)
                        .build());

                Employee emp = employeeRepository.save(Employee.builder()
                        .employeeId(data[0])
                        .firstName(data[1])
                        .lastName(data[2])
                        .email(data[3])
                        .phone(data[4])
                        .department(data[5])
                        .designation(data[6])
                        .joiningDate(LocalDate.now().minusMonths(6 + idx))
                        .salary(Double.parseDouble(data[7]))
                        .status("ACTIVE")
                        .user(empUser)
                        .build());
                createdEmployees.add(emp);
                idx++;
            }

            // 4. Projects (5 Projects)
            Project p1 = projectRepository.save(Project.builder()
                    .projectName("NextGen Core Cloud Platform")
                    .description("Migration and modernization of core infrastructure to Kubernetes and microservices")
                    .startDate(LocalDate.now().minusMonths(3))
                    .endDate(LocalDate.now().plusMonths(6))
                    .status("IN_PROGRESS")
                    .progressPercentage(65)
                    .projectManager(mgr1)
                    .build());

            Project p2 = projectRepository.save(Project.builder()
                    .projectName("Customer Portal Redesign")
                    .description("Complete UI/UX overhaul using React, Vite, Framer Motion, and Tailwind token system")
                    .startDate(LocalDate.now().minusMonths(2))
                    .endDate(LocalDate.now().plusMonths(3))
                    .status("IN_PROGRESS")
                    .progressPercentage(40)
                    .projectManager(mgr2)
                    .build());

            Project p3 = projectRepository.save(Project.builder()
                    .projectName("Automated Billing & Invoicing Engine")
                    .description("Financial transaction processing and compliance reporting engine")
                    .startDate(LocalDate.now().minusMonths(5))
                    .endDate(LocalDate.now().minusDays(10))
                    .status("COMPLETED")
                    .progressPercentage(100)
                    .projectManager(mgr1)
                    .build());

            Project p4 = projectRepository.save(Project.builder()
                    .projectName("Mobile AI Assistant")
                    .description("Intelligent agent for employee workflows and natural language search")
                    .startDate(LocalDate.now().plusDays(15))
                    .endDate(LocalDate.now().plusMonths(9))
                    .status("PLANNED")
                    .progressPercentage(0)
                    .projectManager(mgr2)
                    .build());

            Project p5 = projectRepository.save(Project.builder()
                    .projectName("Enterprise Security Audit & Compliance")
                    .description("SOC2 compliance verification and vulnerability remediation")
                    .startDate(LocalDate.now().minusMonths(1))
                    .endDate(LocalDate.now().plusMonths(2))
                    .status("IN_PROGRESS")
                    .progressPercentage(50)
                    .projectManager(adminEmp)
                    .build());

            // Assign Employees to Projects
            projectAssignmentRepository.save(ProjectAssignment.builder()
                    .project(p1).employee(createdEmployees.get(0)).projectRole("Lead Architect").assignedDate(LocalDate.now().minusMonths(3)).build());
            projectAssignmentRepository.save(ProjectAssignment.builder()
                    .project(p1).employee(createdEmployees.get(1)).projectRole("Senior Backend Dev").assignedDate(LocalDate.now().minusMonths(3)).build());
            projectAssignmentRepository.save(ProjectAssignment.builder()
                    .project(p2).employee(createdEmployees.get(2)).projectRole("Frontend Engineer").assignedDate(LocalDate.now().minusMonths(2)).build());
            projectAssignmentRepository.save(ProjectAssignment.builder()
                    .project(p2).employee(createdEmployees.get(3)).projectRole("Lead Designer").assignedDate(LocalDate.now().minusMonths(2)).build());
            projectAssignmentRepository.save(ProjectAssignment.builder()
                    .project(p1).employee(createdEmployees.get(8)).projectRole("DevOps Specialist").assignedDate(LocalDate.now().minusMonths(2)).build());

            // 5. Parking Slots (P01 through P10)
            String[] slots = {"P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10"};
            List<ParkingSlot> createdSlots = new java.util.ArrayList<>();
            for (int i = 0; i < slots.length; i++) {
                ParkingSlot slot = parkingSlotRepository.save(ParkingSlot.builder()
                        .slotNumber(slots[i])
                        .floor(i < 5 ? "Ground Floor (Level A)" : "Basement (Level B)")
                        .status(i < 3 ? "OCCUPIED" : (i == 3 ? "RESERVED" : "AVAILABLE"))
                        .build());
                createdSlots.add(slot);
            }

            // Parking Allocations
            parkingAllocationRepository.save(ParkingAllocation.builder()
                    .slot(createdSlots.get(0))
                    .employee(adminEmp)
                    .vehicleNumber("KA-01-MJ-9999")
                    .vehicleType("4-Wheeler (Car)")
                    .requestDate(LocalDate.now().minusMonths(2))
                    .allocatedDate(LocalDate.now().minusMonths(2))
                    .status("ALLOCATED")
                    .build());

            parkingAllocationRepository.save(ParkingAllocation.builder()
                    .slot(createdSlots.get(1))
                    .employee(mgr1)
                    .vehicleNumber("KA-05-AB-4321")
                    .vehicleType("4-Wheeler (Car)")
                    .requestDate(LocalDate.now().minusMonths(1))
                    .allocatedDate(LocalDate.now().minusMonths(1))
                    .status("ALLOCATED")
                    .build());

            parkingAllocationRepository.save(ParkingAllocation.builder()
                    .slot(createdSlots.get(3))
                    .employee(createdEmployees.get(0))
                    .vehicleNumber("KA-03-CD-8822")
                    .vehicleType("4-Wheeler (Car)")
                    .requestDate(LocalDate.now().minusDays(5))
                    .status("PENDING")
                    .build());

            // 6. Attendance for past 5 days
            LocalDate today = LocalDate.now();
            for (int d = 0; d < 5; d++) {
                LocalDate date = today.minusDays(d);
                if (date.getDayOfWeek().getValue() <= 5) { // Weekday
                    for (Employee emp : createdEmployees) {
                        attendanceRepository.save(Attendance.builder()
                                .employee(emp)
                                .date(date)
                                .checkIn(LocalTime.of(9, (int)(Math.random() * 20)))
                                .checkOut(LocalTime.of(17, 30 + (int)(Math.random() * 30)))
                                .status("PRESENT")
                                .remarks("Standard working hours")
                                .build());
                    }
                }
            }

            // 7. Leave Requests
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(createdEmployees.get(0))
                    .leaveType("ANNUAL")
                    .startDate(today.plusDays(7))
                    .endDate(today.plusDays(9))
                    .totalDays(3)
                    .reason("Family vacation and rest")
                    .status("PENDING")
                    .build());

            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(createdEmployees.get(1))
                    .leaveType("SICK")
                    .startDate(today.minusDays(10))
                    .endDate(today.minusDays(9))
                    .totalDays(2)
                    .reason("Fever and medical consultation")
                    .status("APPROVED")
                    .reviewedBy(manager1User)
                    .reviewComment("Approved. Take care and recover quickly.")
                    .build());

            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(createdEmployees.get(2))
                    .leaveType("CASUAL")
                    .startDate(today.plusDays(14))
                    .endDate(today.plusDays(15))
                    .totalDays(2)
                    .reason("Personal urgent matters")
                    .status("PENDING")
                    .build());

            // 8. Salaries / Payroll Records
            for (Employee emp : createdEmployees) {
                double base = emp.getSalary();
                double allowance = 3500.0;
                double deduction = 1200.0;
                salaryRepository.save(Salary.builder()
                        .employee(emp)
                        .month("September")
                        .year(2026)
                        .basicPay(base)
                        .allowances(allowance)
                        .deductions(deduction)
                        .netPay(base + allowance - deduction)
                        .paymentStatus("PAID")
                        .remarks("Regular monthly payroll transfer")
                        .build());
            }

            // 9. Notifications
            notificationRepository.save(Notification.builder()
                    .user(adminUser)
                    .title("System Ready")
                    .message("Employee Management System successfully initialized with PostgreSQL database persistence.")
                    .type("SUCCESS")
                    .isRead(false)
                    .build());

            notificationRepository.save(Notification.builder()
                    .user(manager1User)
                    .title("Pending Leave Request")
                    .message("John Doe (EMP-1001) has submitted an Annual Leave request for review.")
                    .type("INFO")
                    .isRead(false)
                    .build());

            notificationRepository.save(Notification.builder()
                    .user(createdEmployees.get(0).getUser())
                    .title("Welcome to SecureX EMS")
                    .message("Welcome aboard! Please check your profile and assigned project roadmap.")
                    .type("INFO")
                    .isRead(false)
                    .build());

            log.info("PostgreSQL Database successfully seeded with 1 Admin, 2 Managers, 10 Employees, 5 Projects, Parking Slots, Attendance, Leaves, and Payroll!");
        }
    }
}
