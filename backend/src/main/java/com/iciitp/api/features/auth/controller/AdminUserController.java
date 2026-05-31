package com.iciitp.api.features.auth.controller;

import com.iciitp.api.features.auth.dto.CreateUserRequest;
import com.iciitp.api.features.auth.dto.ResetPasswordRequest;
import com.iciitp.api.features.auth.dto.UserResponse;
import com.iciitp.api.features.auth.entity.User;
import com.iciitp.api.features.auth.repository.UserRepository;
import com.iciitp.api.features.auth.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

record PermissionsRequest(List<String> permissions) {}

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final UserRepository userRepository;

    /** Any ADMIN may list users. */
    @GetMapping
    public ResponseEntity<List<UserResponse>> list() {
        return ResponseEntity.ok(adminUserService.listAll());
    }

    /** Only super-admins may create new users. */
    @PostMapping
    public ResponseEntity<UserResponse> create(
        @Valid @RequestBody CreateUserRequest request,
        @AuthenticationPrincipal UserDetails caller
    ) {
        requireSuperAdmin(caller);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(adminUserService.create(request, caller.getUsername()));
    }

    /** Only super-admins may deactivate users. */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivate(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails caller
    ) {
        requireSuperAdmin(caller);
        return ResponseEntity.ok(adminUserService.setActive(id, false));
    }

    /** Only super-admins may reactivate users. */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activate(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails caller
    ) {
        requireSuperAdmin(caller);
        return ResponseEntity.ok(adminUserService.setActive(id, true));
    }

    /** Only super-admins may update user permissions. */
    @PatchMapping("/{id}/permissions")
    public ResponseEntity<UserResponse> updatePermissions(
        @PathVariable String id,
        @RequestBody PermissionsRequest req,
        @AuthenticationPrincipal UserDetails caller
    ) {
        requireSuperAdmin(caller);
        return ResponseEntity.ok(adminUserService.updatePermissions(id, req.permissions() != null ? req.permissions() : List.of()));
    }

    /** Only super-admins may reset passwords. */
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
        @PathVariable String id,
        @Valid @RequestBody ResetPasswordRequest request,
        @AuthenticationPrincipal UserDetails caller
    ) {
        requireSuperAdmin(caller);
        adminUserService.resetPassword(id, request);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    /** Only super-admins may delete users. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails caller
    ) {
        requireSuperAdmin(caller);
        adminUserService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void requireSuperAdmin(UserDetails caller) {
        User user = userRepository.findByEmail(caller.getUsername())
            .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Forbidden"));
        if (!user.isSuperAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException(
                "Only super-admins can perform this action");
        }
    }
}
