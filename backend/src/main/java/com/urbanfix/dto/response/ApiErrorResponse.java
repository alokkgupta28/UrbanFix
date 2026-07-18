package com.urbanfix.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiErrorResponse {
    private int status;
    private String message;
    private String timestamp;

    public static ApiErrorResponse of(int status, String message) {
        return ApiErrorResponse.builder()
                .status(status)
                .message(message)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
