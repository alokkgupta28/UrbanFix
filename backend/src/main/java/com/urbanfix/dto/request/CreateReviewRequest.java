package com.urbanfix.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateReviewRequest {

    @NotBlank private String bookingId;
    @NotBlank private String providerId;
    @NotBlank private String customerName;
    @NotBlank private String customerCity;

    @Min(1) @Max(5) private int rating;

    @NotBlank @Size(min = 10, max = 500) private String comment;
}
