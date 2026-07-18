package com.urbanfix.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AuthResponse {
    private String token;
    private UserData user;

    @Data
    @Builder
    public static class UserData {
        private String id;
        private String email;
        private String full_name;
        private List<String> roles;
    }
}
