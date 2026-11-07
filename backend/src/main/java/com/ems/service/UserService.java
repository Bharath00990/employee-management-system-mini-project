package com.ems.service;

import com.ems.dto.request.CreateUserRequest;
import com.ems.dto.request.UserStatusRequest;
import com.ems.dto.response.UserResponse;
import com.ems.entity.User;
import java.util.List;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUserStatus(Long id, UserStatusRequest request);
    List<UserResponse> getAllUsers();
    User internalCreateUser(String username, String rawPassword, String role);
}
