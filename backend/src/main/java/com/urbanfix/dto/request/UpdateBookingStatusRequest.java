package com.urbanfix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateBookingStatusRequest {
    @NotBlank private String status;
}
