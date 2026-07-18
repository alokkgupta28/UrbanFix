package com.urbanfix.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CancelResponse {
    private boolean ok;
    private boolean refunded;
    private String error;
}
