package com.urbanfix.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VerifyPaymentRequest {

    private String bookingId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
