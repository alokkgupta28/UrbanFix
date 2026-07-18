package com.urbanfix.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckoutResponse {
    private String orderId;
    private Integer amount;    // in paise
    private String currency;
    private String error;
}
