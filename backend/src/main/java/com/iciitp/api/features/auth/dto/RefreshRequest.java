package com.iciitp.api.features.auth.dto;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}
