package com.iciitp.api.features.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusRequest {
    @NotBlank
    private String status;
}
