package com.iciitp.api.features.auth.dto;

import com.iciitp.api.features.auth.entity.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String role;
    private boolean superAdmin;
    private boolean active;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<String> permissions;

    public static UserResponse from(User user) {
        UserResponse r = new UserResponse();
        r.id          = user.getId();
        r.email       = user.getEmail();
        r.role        = user.getRole().name();
        r.superAdmin  = user.isSuperAdmin();
        r.active      = user.isActive();
        r.createdBy   = user.getCreatedBy();
        r.createdAt   = user.getCreatedAt();
        r.permissions = user.getPermissions();
        return r;
    }
}
