package com.urbanfix.dto.response;

import com.urbanfix.entity.Booking;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String customer_id;
    private String provider_id;
    private String category_id;
    private String scheduled_at;
    private String address_line;
    private String address_city;
    private String address_pincode;
    private String notes;
    private String contact_phone;
    private String status;
    private Integer total_amount;
    private String payment_method;
    private String stripe_session_id;
    private String stripe_payment_status;
    private String stripe_environment;
    private Boolean disputed;
    private String dispute_reason;
    private String admin_notes;
    private String created_at;

    public static BookingResponse from(Booking b) {
        if (b == null) return null;
        return BookingResponse.builder()
                .id(String.valueOf(b.getId()))
                .customer_id(String.valueOf(b.getCustomerId()))
                .provider_id(String.valueOf(b.getProvider().getId()))
                .category_id(String.valueOf(b.getCategory().getId()))
                .scheduled_at(b.getScheduledAt() != null ? b.getScheduledAt().toString() : null)
                .address_line(b.getAddressLine())
                .address_city(b.getAddressCity())
                .address_pincode(b.getAddressPincode())
                .notes(b.getNotes())
                .contact_phone(b.getContactPhone())
                .status(b.getStatus().name())
                .total_amount(b.getTotalAmount())
                .payment_method(b.getPaymentMethod())
                .stripe_session_id(b.getStripeSessionId())
                .stripe_payment_status(b.getStripePaymentStatus())
                .stripe_environment(b.getStripeEnvironment())
                .disputed(b.getDisputed())
                .dispute_reason(b.getDisputeReason())
                .admin_notes(b.getAdminNotes())
                .created_at(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null)
                .build();
    }
}
