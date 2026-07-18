package com.urbanfix.entity.enums;

/**
 * Maps to PostgreSQL enum type: public.booking_status
 */
public enum BookingStatus {
    pending,
    confirmed,
    in_progress,
    completed,
    cancelled
}
