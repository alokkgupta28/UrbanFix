package com.urbanfix.util;

import com.urbanfix.entity.enums.BookingStatus;
import com.urbanfix.exception.BadRequestException;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Enforces booking status transition rules matching the validate_booking()
 * PostgreSQL trigger. This ensures the Java service layer is consistent
 * with the database-level enforcement.
 */
public final class BookingValidator {

    private BookingValidator() {}

    /**
     * Validate a status transition for a customer.
     * Customers can only cancel from pending/confirmed before scheduled time.
     */
    public static void validateCustomerTransition(BookingStatus oldStatus,
                                                   BookingStatus newStatus,
                                                   OffsetDateTime scheduledAt) {
        if (newStatus != BookingStatus.cancelled) {
            throw new BadRequestException("Customers can only cancel bookings");
        }
        if (scheduledAt.isBefore(OffsetDateTime.now()) || scheduledAt.isEqual(OffsetDateTime.now())) {
            throw new BadRequestException("Cannot cancel after the scheduled time");
        }
        if (oldStatus != BookingStatus.pending && oldStatus != BookingStatus.confirmed) {
            throw new BadRequestException("Booking cannot be cancelled from status " + oldStatus);
        }
    }

    /**
     * Validate a status transition for a provider.
     * confirmed → in_progress, in_progress → completed (only after scheduled time).
     */
    public static void validateProviderTransition(BookingStatus oldStatus,
                                                   BookingStatus newStatus,
                                                   OffsetDateTime scheduledAt) {
        boolean valid =
                (oldStatus == BookingStatus.confirmed && newStatus == BookingStatus.in_progress) ||
                (oldStatus == BookingStatus.in_progress && newStatus == BookingStatus.completed);

        if (!valid) {
            throw new BadRequestException(
                    "Invalid status transition: " + oldStatus + " -> " + newStatus);
        }
        if (newStatus == BookingStatus.completed && scheduledAt.isAfter(OffsetDateTime.now())) {
            throw new BadRequestException("Cannot mark completed before the scheduled time");
        }
    }

    /**
     * Determine initial booking status based on payment method.
     * Mirrors the validate_booking trigger INSERT logic.
     */
    public static BookingStatus initialStatus(String paymentMethod) {
        return "pay_after".equals(paymentMethod)
                ? BookingStatus.confirmed
                : BookingStatus.pending;
    }
}
