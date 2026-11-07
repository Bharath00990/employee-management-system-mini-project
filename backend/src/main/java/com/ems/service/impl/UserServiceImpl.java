package com.ems.service.impl;

import com.ems.dto.request.CreateUserRequest;
import com.ems.dto.request.UserStatusRequest;
import com.ems.dto.response.UserResponse;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.UserRepository;
import com.ems.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (!"EMPLOYEE".equals(request.getRole()) && !"PROJECT_MANAGER".equals(request.getRole())) {
            throw new IllegalArgumentException("Invalid role. Must be EMPLOYEE or PROJECT_MANAGER.");
        }
        User user = internalCreateUser(request.getUsername(), request.getPassword(), request.getRole());
        return mapToResponse(user);
    }

    @Override
    public User internalCreateUser(String username, String rawPassword, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.valueOf(role));
        user.setEnabled(true);
        return userRepository.save(user);
    }

    @Override
    public UserResponse updateUserStatus(Long id, UserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(request.getEnabled());
        userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());
        response.setEnabled(user.isEnabled());
        return response;
    }
}
