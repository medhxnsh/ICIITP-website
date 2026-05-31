package com.iciitp.api.features.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OtpResetRequest {
    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6, max = 6)
    private String otp;

    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;
}
