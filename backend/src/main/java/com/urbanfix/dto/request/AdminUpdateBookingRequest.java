package com.urbanfix.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUpdateBookingRequest {
    private Boolean disputed;
    
    @JsonProperty("admin_notes")
    private String adminNotes;
}
