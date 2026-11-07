package com.ems.controller;

import com.ems.dto.request.CreateSalaryRequest;
import com.ems.dto.request.UpdateSalaryRequest;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.SalaryRepository;
import com.ems.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class SalaryIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SalaryRepository salaryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Employee testEmployee;
    private Employee otherEmployee;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
                
        salaryRepository.deleteAll();
        employeeRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user 1 (Employee)
        User user = new User();
        user.setUsername("testemp1");
        user.setPassword(passwordEncoder.encode("password"));
        user.setRole(Role.EMPLOYEE);
        user = userRepository.save(user);

        testEmployee = new Employee();
        testEmployee.setUser(user);
        testEmployee.setEmployeeCode("EMP" + UUID.randomUUID().toString().substring(0, 5));
        testEmployee.setFirstName("Test");
        testEmployee.setLastName("Employee1");
        testEmployee.setEmail("test1@example.com");
        testEmployee.setDateOfJoining(LocalDate.now());
        testEmployee = employeeRepository.save(testEmployee);

        // Create test user 2 (Employee)
        User user2 = new User();
        user2.setUsername("testemp2");
        user2.setPassword(passwordEncoder.encode("password"));
        user2.setRole(Role.EMPLOYEE);
        user2 = userRepository.save(user2);

        otherEmployee = new Employee();
        otherEmployee.setUser(user2);
        otherEmployee.setEmployeeCode("EMP" + UUID.randomUUID().toString().substring(0, 5));
        otherEmployee.setFirstName("Test");
        otherEmployee.setLastName("Employee2");
        otherEmployee.setEmail("test2@example.com");
        otherEmployee.setDateOfJoining(LocalDate.now());
        otherEmployee = employeeRepository.save(otherEmployee);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCreateSalary() throws Exception {
        CreateSalaryRequest request = new CreateSalaryRequest();
        request.setEmployeeId(testEmployee.getId());
        request.setMonth(5);
        request.setYear(2026);
        request.setBasicSalary(new BigDecimal("50000.00"));
        request.setDeductions(new BigDecimal("2000.00"));

        mockMvc.perform(post("/api/admin/salaries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.salaryId", notNullValue()))
                .andExpect(jsonPath("$.netSalary", is(48000.0))); // Net salary calculated correctly
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createSalaryForNonexistentEmployee_Returns404() throws Exception {
        CreateSalaryRequest request = new CreateSalaryRequest();
        request.setEmployeeId(9999L);
        request.setMonth(5);
        request.setYear(2026);
        request.setBasicSalary(new BigDecimal("50000.00"));
        request.setDeductions(new BigDecimal("2000.00"));

        mockMvc.perform(post("/api/admin/salaries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void duplicateSalary_Returns409() throws Exception {
        CreateSalaryRequest request = new CreateSalaryRequest();
        request.setEmployeeId(testEmployee.getId());
        request.setMonth(5);
        request.setYear(2026);
        request.setBasicSalary(new BigDecimal("50000.00"));
        request.setDeductions(new BigDecimal("2000.00"));

        mockMvc.perform(post("/api/admin/salaries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate
        mockMvc.perform(post("/api/admin/salaries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void negativeSalaryValue_Returns400() throws Exception {
        CreateSalaryRequest request = new CreateSalaryRequest();
        request.setEmployeeId(testEmployee.getId());
        request.setMonth(5);
        request.setYear(2026);
        request.setBasicSalary(new BigDecimal("-50000.00"));
        request.setDeductions(new BigDecimal("2000.00"));

        mockMvc.perform(post("/api/admin/salaries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanViewAllSalaries() throws Exception {
        adminCanCreateSalary();

        mockMvc.perform(get("/api/admin/salaries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanViewEmployeeSalary() throws Exception {
        adminCanCreateSalary();

        mockMvc.perform(get("/api/admin/salaries/employee/" + testEmployee.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].employeeId", is(testEmployee.getId().intValue())));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanUpdateSalary() throws Exception {
        CreateSalaryRequest create = new CreateSalaryRequest();
        create.setEmployeeId(testEmployee.getId());
        create.setMonth(5);
        create.setYear(2026);
        create.setBasicSalary(new BigDecimal("50000.00"));
        create.setDeductions(new BigDecimal("2000.00"));

        String response = mockMvc.perform(post("/api/admin/salaries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long salaryId = objectMapper.readTree(response).get("salaryId").asLong();

        UpdateSalaryRequest update = new UpdateSalaryRequest();
        update.setBasicSalary(new BigDecimal("60000.00"));
        update.setDeductions(new BigDecimal("3000.00"));

        mockMvc.perform(put("/api/admin/salaries/" + salaryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.netSalary", is(57000.0)));
    }

    @Test
    @WithMockUser(username = "testemp1", roles = "EMPLOYEE")
    void employeeCanViewOwnSalary() throws Exception {
        // Create salary as admin first (simulate)
        com.ems.entity.Salary salary = new com.ems.entity.Salary();
        salary.setEmployee(testEmployee);
        salary.setMonth(5);
        salary.setYear(2026);
        salary.setBasicSalary(new BigDecimal("50000.00"));
        salary.setDeductions(new BigDecimal("2000.00"));
        salary.setNetSalary(new BigDecimal("48000.00"));
        salaryRepository.save(salary);

        mockMvc.perform(get("/api/employee/salary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].employeeId", is(testEmployee.getId().intValue())));
    }

    @Test
    @WithMockUser(username = "testemp1", roles = "EMPLOYEE")
    void employeeCannotCreateSalary() throws Exception {
        CreateSalaryRequest request = new CreateSalaryRequest();
        request.setEmployeeId(testEmployee.getId());
        request.setMonth(5);
        request.setYear(2026);
        request.setBasicSalary(new BigDecimal("50000.00"));
        request.setDeductions(new BigDecimal("2000.00"));

        mockMvc.perform(post("/api/admin/salaries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "testemp1", roles = "EMPLOYEE")
    void employeeCannotAccessAnotherEmployeeSalary() throws Exception {
        mockMvc.perform(get("/api/admin/salaries/employee/" + otherEmployee.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void managerCannotAccessSalaryApis() throws Exception {
        mockMvc.perform(get("/api/admin/salaries"))
                .andExpect(status().isForbidden());
        
        mockMvc.perform(get("/api/employee/salary"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/admin/salaries"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void nonexistentSalary_Returns404() throws Exception {
        mockMvc.perform(get("/api/admin/salaries/9999"))
                .andExpect(status().isNotFound());
    }
}
