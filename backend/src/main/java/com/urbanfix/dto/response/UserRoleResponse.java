package com.urbanfix.dto.response;

import com.urbanfix.entity.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserRoleResponse {
    private String id;
    private String user_id;
    private String role;
    private String created_at;

    public static UserRoleResponse from(UserRole u) {
        if (u == null) return null;
        return UserRoleResponse.builder()
                .id(String.valueOf(u.getId()))
                .user_id(String.valueOf(u.getUserId()))
                .role(u.getRole().name())
                .created_at(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                .build();
    }
}
