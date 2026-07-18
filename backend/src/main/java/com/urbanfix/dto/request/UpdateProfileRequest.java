package com.urbanfix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProfileRequest {

    @NotBlank @Size(min = 2, max = 80) private String fullName;
    @NotBlank @Size(min = 6, max = 20) private String phone;
    @Size(max = 60) private String city;
}
