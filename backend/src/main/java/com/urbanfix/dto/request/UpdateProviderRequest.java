package com.urbanfix.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProviderRequest {
    private Boolean verified;
    private String userId;      // null to unclaim
}
