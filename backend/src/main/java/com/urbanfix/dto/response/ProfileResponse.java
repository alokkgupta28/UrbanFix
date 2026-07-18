package com.urbanfix.dto.response;

import com.urbanfix.entity.Profile;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private String id;
    private String full_name;
    private String phone;
    private String avatar_url;
    private String city;

    public static ProfileResponse from(Profile p) {
        if (p == null) return null;
        return ProfileResponse.builder()
                .id(String.valueOf(p.getId()))
                .full_name(p.getFullName())
                .phone(p.getPhone())
                .avatar_url(p.getAvatarUrl())
                .city(p.getCity())
                .build();
    }
}
