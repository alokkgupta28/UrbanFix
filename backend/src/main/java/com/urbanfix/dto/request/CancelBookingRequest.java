package com.urbanfix.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CancelBookingRequest {

    private String reason;
    private String bookingId;
}
