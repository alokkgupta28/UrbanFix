package com.urbanfix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GrantRoleRequest {

    @NotBlank private String userId;
    @NotBlank private String role;   // "admin", "provider", "customer"
}
