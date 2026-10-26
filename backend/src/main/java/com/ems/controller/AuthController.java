package com.ems.controller;

import com.ems.dto.request.LoginRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.JwtResponse;
import com.ems.entity.AuditLog;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import com.ems.security.JwtUtils;
import com.ems.security.UserDetailsImpl;
import com.ems.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        Optional<Employee> employeeOpt = employeeRepository.findByUserId(userDetails.getId());
        Long empId = employeeOpt.map(Employee::getId).orElse(null);
        String empCode = employeeOpt.map(Employee::getEmployeeId).orElse(null);
        String fullName = employeeOpt.map(e -> e.getFirstName() + " " + e.getLastName()).orElse(userDetails.getUsername());

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .roles(roles)
                .employeeId(empId)
                .employeeCode(empCode)
                .fullName(fullName)
                .build();

        auditLogService.log("LOGIN", userDetails.getUsername(), roles.isEmpty() ? "USER" : roles.get(0), "User", userDetails.getId(), "User logged in successfully", request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Authentication successful", jwtResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<JwtResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        Optional<Employee> employeeOpt = employeeRepository.findByUserId(userDetails.getId());

        JwtResponse res = JwtResponse.builder()
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .roles(roles)
                .employeeId(employeeOpt.map(Employee::getId).orElse(null))
                .employeeCode(employeeOpt.map(Employee::getEmployeeId).orElse(null))
                .fullName(employeeOpt.map(e -> e.getFirstName() + " " + e.getLastName()).orElse(userDetails.getUsername()))
                .build();

        return ResponseEntity.ok(ApiResponse.success(res));
    }
}
