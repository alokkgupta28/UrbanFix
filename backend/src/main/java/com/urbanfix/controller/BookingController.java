package com.urbanfix.controller;

import com.urbanfix.dto.request.CreateBookingRequest;
import com.urbanfix.dto.request.ReportDisputeRequest;
import com.urbanfix.dto.request.UpdateBookingStatusRequest;
import com.urbanfix.dto.request.CancelBookingRequest;
import com.urbanfix.dto.response.BookingResponse;
import com.urbanfix.security.AuthenticatedUser;
import com.urbanfix.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false, defaultValue = "false") boolean all,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (all && user.getRoles() != null && user.getRoles().contains("admin")) {
            return ResponseEntity.ok(bookingService.findAll());
        }
        return ResponseEntity.ok(bookingService.findByCustomer(user.getUserId()));
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<BookingResponse>> getProviderBookings(@PathVariable Long providerId) {
        return ResponseEntity.ok(bookingService.findByProvider(providerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(bookingService.findById(id, user));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest req,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(bookingService.createBooking(req, user));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id,
            @Valid @RequestBody CancelBookingRequest req, @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, req.getReason(), user));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BookingResponse> updateStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateBookingStatusRequest req, @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(bookingService.updateStatus(id, req, user));
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<BookingResponse> reportDispute(@PathVariable Long id,
            @Valid @RequestBody ReportDisputeRequest req, @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(bookingService.reportDispute(id, req.getReason(), user));
    }

    @PatchMapping("/{id}/admin")
    public ResponseEntity<BookingResponse> adminUpdate(@PathVariable Long id,
            @Valid @RequestBody com.urbanfix.dto.request.AdminUpdateBookingRequest req, @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(bookingService.adminUpdate(id, req, user));
    }
}
