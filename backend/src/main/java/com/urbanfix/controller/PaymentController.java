package com.urbanfix.controller;

import com.urbanfix.dto.request.CancelBookingRequest;
import com.urbanfix.dto.request.CheckoutRequest;
import com.urbanfix.dto.request.VerifyPaymentRequest;
import com.urbanfix.dto.response.CancelResponse;
import com.urbanfix.dto.response.CheckoutResponse;
import com.urbanfix.security.AuthenticatedUser;
import com.urbanfix.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;

    /**
     * Create a Razorpay order for the given booking.
     */
    @PostMapping("/checkout")
    public CheckoutResponse checkout(@Valid @RequestBody CheckoutRequest req,
                                      @AuthenticationPrincipal AuthenticatedUser auth) {
        return razorpayService.createOrder(req, auth.getUserId());
    }

    /**
     * Verify payment after Razorpay checkout callback.
     */
    @PostMapping("/verify")
    public CheckoutResponse verify(@Valid @RequestBody VerifyPaymentRequest req,
                                    @AuthenticationPrincipal AuthenticatedUser auth) {
        return razorpayService.verifyPayment(req, auth.getUserId());
    }

    /**
     * Cancel a booking and optionally refund.
     */
    @PostMapping("/cancel")
    public CancelResponse cancel(@Valid @RequestBody CancelBookingRequest req,
                                  @AuthenticationPrincipal AuthenticatedUser auth) {
        return razorpayService.cancelBooking(req, auth.getUserId());
    }
}
