package com.ems.controller;

import com.ems.dto.response.ApiResponse;
import com.ems.entity.ERole;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.exception.ConflictException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.RoleRepository;
import com.ems.repository.UserRepository;
import com.ems.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Data
    public static class UserCreateRequest {
        private String username;
        private String email;
        private String password;
        private List<String> roles;
    }

    @Data
    public static class UserStatusUpdateRequest {
        private Boolean active;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody UserCreateRequest req, HttpServletRequest request) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ConflictException("Username already exists");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        Set<Role> roles = new HashSet<>();
        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            for (String r : req.getRoles()) {
                ERole erole = ERole.valueOf(r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase());
                roleRepository.findByName(erole).ifPresent(roles::add);
            }
        } else {
            roleRepository.findByName(ERole.ROLE_EMPLOYEE).ifPresent(roles::add);
        }

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .roles(roles)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        auditLogService.log("USER_CREATED", request.getUserPrincipal().getName(), "ADMIN", "User", saved.getId(), "Created user: " + saved.getUsername(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("User created successfully", saved));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long id, @RequestBody UserStatusUpdateRequest req, HttpServletRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(req.getActive());
        User saved = userRepository.save(user);

        auditLogService.log("USER_STATUS_UPDATED", request.getUserPrincipal().getName(), "ADMIN", "User", saved.getId(), "Set active status to " + req.getActive() + " for " + user.getUsername(), request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("User status updated", saved));
    }
}
