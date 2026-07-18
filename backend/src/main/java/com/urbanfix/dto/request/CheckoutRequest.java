package com.urbanfix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckoutRequest {

    @NotBlank(message = "bookingId is required")
    private String bookingId;

    private String returnUrl;
}
