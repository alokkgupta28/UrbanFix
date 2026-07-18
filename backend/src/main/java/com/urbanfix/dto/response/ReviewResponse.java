package com.urbanfix.dto.response;

import com.urbanfix.entity.Review;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewResponse {
    private String id;
    private String provider_id;
    private String booking_id;
    private String customer_id;
    private String customer_name;
    private String customer_city;
    private Integer rating;
    private String comment;
    private String created_at;

    public static ReviewResponse from(Review r) {
        if (r == null) return null;
        return ReviewResponse.builder()
                .id(String.valueOf(r.getId()))
                .provider_id(String.valueOf(r.getProviderId()))
                .booking_id(String.valueOf(r.getBookingId()))
                .customer_id(r.getCustomerId() != null ? String.valueOf(r.getCustomerId()) : null)
                .customer_name(r.getCustomerName())
                .customer_city(r.getCustomerCity())
                .rating(r.getRating())
                .comment(r.getComment())
                .created_at(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .build();
    }
}
