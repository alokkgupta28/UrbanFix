package com.urbanfix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReportDisputeRequest {

    @NotBlank
    @Size(min = 10, max = 500)
    private String reason;
}
