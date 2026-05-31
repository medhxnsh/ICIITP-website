package com.iciitp.api.features.auth.service;

import com.iciitp.api.features.auth.dto.CreateUserRequest;
import com.iciitp.api.features.auth.dto.ResetPasswordRequest;
import com.iciitp.api.features.auth.dto.UserResponse;
import com.iciitp.api.features.auth.entity.User;
import com.iciitp.api.features.auth.repository.UserRepository;
import com.iciitp.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
            .map(UserResponse::from)
            .toList();
    }

    public UserResponse create(CreateUserRequest request, String createdByEmail) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("A user with this email already exists");
        }
        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(User.Role.ADMIN)
            .superAdmin(false)
            .active(true)
            .createdBy(createdByEmail)
            .permissions(request.getPermissions() != null ? request.getPermissions() : new java.util.ArrayList<>())
            .build();
        return UserResponse.from(userRepository.save(user));
    }

    @org.springframework.transaction.annotation.Transactional
    public UserResponse updatePermissions(String id, List<String> permissions) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.isSuperAdmin()) {
            throw new IllegalArgumentException("Cannot modify super-admin permissions");
        }
        user.getPermissions().clear();
        user.getPermissions().addAll(permissions);
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse setActive(String id, boolean active) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.isSuperAdmin()) {
            throw new IllegalArgumentException("Cannot deactivate the super-admin account");
        }
        user.setActive(active);
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse resetPassword(String id, ResetPasswordRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        return UserResponse.from(userRepository.save(user));
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.isSuperAdmin()) {
            throw new IllegalArgumentException("Cannot delete a super-admin account");
        }
        userRepository.delete(user);
    }
}
