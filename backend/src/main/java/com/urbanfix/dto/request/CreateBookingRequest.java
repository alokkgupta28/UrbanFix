package com.urbanfix.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateBookingRequest {

    @NotBlank private String providerId;
    @NotBlank private String categoryId;
    @NotBlank private String scheduledAt;

    @NotBlank @Size(min = 6) private String addressLine;
    @NotBlank @Size(min = 2) private String addressCity;
    @NotBlank @Pattern(regexp = "^\\d{6}$") private String addressPincode;

    @Size(max = 500) private String notes;
    @NotBlank private String contactPhone;
    @NotBlank private String paymentMethod;   // "card" or "pay_after"
}
