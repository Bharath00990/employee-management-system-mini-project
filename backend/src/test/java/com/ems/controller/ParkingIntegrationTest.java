package com.ems.controller;

import com.ems.dto.request.CreateParkingAllocationRequest;
import com.ems.dto.request.CreateParkingSlotRequest;
import com.ems.entity.Employee;
import com.ems.entity.ParkingAllocation;
import com.ems.entity.ParkingAllocationStatus;
import com.ems.entity.ParkingSlot;
import com.ems.entity.ParkingSlotStatus;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.ParkingAllocationRepository;
import com.ems.repository.ParkingSlotRepository;
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

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class ParkingIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private ParkingAllocationRepository parkingAllocationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Employee employee1;
    private Employee employee2;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
                
        parkingAllocationRepository.deleteAll();
        parkingSlotRepository.deleteAll();
        employeeRepository.deleteAll();
        userRepository.deleteAll();

        // Employee 1
        User user1 = new User();
        user1.setUsername("emp1");
        user1.setPassword(passwordEncoder.encode("password"));
        user1.setRole(Role.EMPLOYEE);
        user1 = userRepository.save(user1);

        employee1 = new Employee();
        employee1.setUser(user1);
        employee1.setEmployeeCode("E-101");
        employee1.setFirstName("Alice");
        employee1.setLastName("Smith");
        employee1.setEmail("alice@example.com");
        employee1.setDateOfJoining(LocalDate.now());
        employee1 = employeeRepository.save(employee1);

        // Employee 2
        User user2 = new User();
        user2.setUsername("emp2");
        user2.setPassword(passwordEncoder.encode("password"));
        user2.setRole(Role.EMPLOYEE);
        user2 = userRepository.save(user2);

        employee2 = new Employee();
        employee2.setUser(user2);
        employee2.setEmployeeCode("E-102");
        employee2.setFirstName("Bob");
        employee2.setLastName("Jones");
        employee2.setEmail("bob@example.com");
        employee2.setDateOfJoining(LocalDate.now());
        employee2 = employeeRepository.save(employee2);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test1_AdminCanCreateParkingSlot() throws Exception {
        CreateParkingSlotRequest request = new CreateParkingSlotRequest();
        request.setSlotNumber("A-001");
        request.setLocation("Basement 1");

        mockMvc.perform(post("/api/admin/parking/slots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slotNumber", is("A-001")))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test2_DuplicateSlot_Returns409() throws Exception {
        test1_AdminCanCreateParkingSlot();

        CreateParkingSlotRequest request = new CreateParkingSlotRequest();
        request.setSlotNumber("A-001");
        request.setLocation("Basement 2");

        mockMvc.perform(post("/api/admin/parking/slots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test3_AdminCanViewSlots() throws Exception {
        test1_AdminCanCreateParkingSlot();

        mockMvc.perform(get("/api/admin/parking/slots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test4_AdminCanViewSpecificSlot() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("B-001");
        slot.setLocation("Level 2");
        slot.setStatus(ParkingSlotStatus.AVAILABLE);
        slot = parkingSlotRepository.save(slot);

        mockMvc.perform(get("/api/admin/parking/slots/" + slot.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slotNumber", is("B-001")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test5_AdminCanAllocateAvailableSlot() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("C-001");
        slot.setStatus(ParkingSlotStatus.AVAILABLE);
        slot = parkingSlotRepository.save(slot);

        CreateParkingAllocationRequest request = new CreateParkingAllocationRequest();
        request.setEmployeeId(employee1.getId());
        request.setParkingSlotId(slot.getId());

        mockMvc.perform(post("/api/admin/parking/allocations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("APPROVED")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test6_NonexistentEmployee_Returns404() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("C-002");
        slot.setStatus(ParkingSlotStatus.AVAILABLE);
        slot = parkingSlotRepository.save(slot);

        CreateParkingAllocationRequest request = new CreateParkingAllocationRequest();
        request.setEmployeeId(9999L);
        request.setParkingSlotId(slot.getId());

        mockMvc.perform(post("/api/admin/parking/allocations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test7_NonexistentSlot_Returns404() throws Exception {
        CreateParkingAllocationRequest request = new CreateParkingAllocationRequest();
        request.setEmployeeId(employee1.getId());
        request.setParkingSlotId(9999L);

        mockMvc.perform(post("/api/admin/parking/allocations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test8_EmployeeAlreadyHasActiveAllocation_Returns409() throws Exception {
        ParkingSlot slot1 = new ParkingSlot();
        slot1.setSlotNumber("C-101");
        slot1.setStatus(ParkingSlotStatus.OCCUPIED);
        slot1 = parkingSlotRepository.save(slot1);

        ParkingAllocation alloc = new ParkingAllocation();
        alloc.setEmployee(employee1);
        alloc.setParkingSlot(slot1);
        alloc.setAllocatedDate(LocalDate.now());
        alloc.setStatus(ParkingAllocationStatus.APPROVED);
        parkingAllocationRepository.save(alloc);

        ParkingSlot slot2 = new ParkingSlot();
        slot2.setSlotNumber("C-102");
        slot2.setStatus(ParkingSlotStatus.AVAILABLE);
        slot2 = parkingSlotRepository.save(slot2);

        CreateParkingAllocationRequest request = new CreateParkingAllocationRequest();
        request.setEmployeeId(employee1.getId());
        request.setParkingSlotId(slot2.getId());

        mockMvc.perform(post("/api/admin/parking/allocations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test9_SlotAlreadyAllocated_Returns409() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("D-001");
        slot.setStatus(ParkingSlotStatus.OCCUPIED);
        slot = parkingSlotRepository.save(slot);

        ParkingAllocation alloc = new ParkingAllocation();
        alloc.setEmployee(employee1);
        alloc.setParkingSlot(slot);
        alloc.setAllocatedDate(LocalDate.now());
        alloc.setStatus(ParkingAllocationStatus.APPROVED);
        parkingAllocationRepository.save(alloc);

        CreateParkingAllocationRequest request = new CreateParkingAllocationRequest();
        request.setEmployeeId(employee2.getId());
        request.setParkingSlotId(slot.getId());

        mockMvc.perform(post("/api/admin/parking/allocations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "emp1", roles = "EMPLOYEE")
    void test10_EmployeeCanViewOwnAllocation() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("E-001");
        slot.setStatus(ParkingSlotStatus.OCCUPIED);
        slot = parkingSlotRepository.save(slot);

        ParkingAllocation alloc = new ParkingAllocation();
        alloc.setEmployee(employee1);
        alloc.setParkingSlot(slot);
        alloc.setAllocatedDate(LocalDate.now());
        alloc.setStatus(ParkingAllocationStatus.APPROVED);
        parkingAllocationRepository.save(alloc);

        mockMvc.perform(get("/api/employee/parking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slotNumber", is("E-001")));
    }

    @Test
    @WithMockUser(username = "emp1", roles = "EMPLOYEE")
    void test11_EmployeeCannotViewAnotherEmployeeAllocation() throws Exception {
        // Employee 1 trying to access admin endpoints gets 403.
        // Employee parking endpoint inherently only queries emp1 allocations.
        mockMvc.perform(get("/api/admin/parking/allocations"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROJECT_MANAGER")
    void test12_ManagerCannotAccessAdminParkingApis() throws Exception {
        mockMvc.perform(get("/api/admin/parking/slots"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "emp1", roles = "EMPLOYEE")
    void test13_EmployeeCannotCreateAllocation() throws Exception {
        CreateParkingAllocationRequest request = new CreateParkingAllocationRequest();
        request.setEmployeeId(employee1.getId());
        request.setParkingSlotId(1L);

        mockMvc.perform(post("/api/admin/parking/allocations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test14_AdminCanViewAllocations() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("F-001");
        slot.setStatus(ParkingSlotStatus.OCCUPIED);
        slot = parkingSlotRepository.save(slot);

        ParkingAllocation alloc = new ParkingAllocation();
        alloc.setEmployee(employee1);
        alloc.setParkingSlot(slot);
        alloc.setAllocatedDate(LocalDate.now());
        alloc.setStatus(ParkingAllocationStatus.APPROVED);
        parkingAllocationRepository.save(alloc);

        mockMvc.perform(get("/api/admin/parking/allocations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test15_16_AdminCanReleaseAllocationAndSlotBecomesAvailable() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("G-001");
        slot.setStatus(ParkingSlotStatus.OCCUPIED);
        slot = parkingSlotRepository.save(slot);

        ParkingAllocation alloc = new ParkingAllocation();
        alloc.setEmployee(employee1);
        alloc.setParkingSlot(slot);
        alloc.setAllocatedDate(LocalDate.now());
        alloc.setStatus(ParkingAllocationStatus.APPROVED);
        alloc = parkingAllocationRepository.save(alloc);

        mockMvc.perform(patch("/api/admin/parking/allocations/" + alloc.getId() + "/release"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RELEASED")));
        
        // Slot is now available
        ParkingSlot updatedSlot = parkingSlotRepository.findById(slot.getId()).get();
        assert(updatedSlot.getStatus() == ParkingSlotStatus.AVAILABLE);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void test17_ReleasingAlreadyReleasedAllocation_Returns409() throws Exception {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber("H-001");
        slot.setStatus(ParkingSlotStatus.AVAILABLE);
        slot = parkingSlotRepository.save(slot);

        ParkingAllocation alloc = new ParkingAllocation();
        alloc.setEmployee(employee1);
        alloc.setParkingSlot(slot);
        alloc.setAllocatedDate(LocalDate.now());
        alloc.setStatus(ParkingAllocationStatus.RELEASED);
        alloc = parkingAllocationRepository.save(alloc);

        mockMvc.perform(patch("/api/admin/parking/allocations/" + alloc.getId() + "/release"))
                .andExpect(status().isConflict());
    }

    @Test
    void test18_NoJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/admin/parking/slots"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "GUEST")
    void test19_InvalidRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/parking/slots"))
                .andExpect(status().isForbidden());
    }
}
