package com.urbanfix.service;

import com.urbanfix.dto.request.CancelBookingRequest;
import com.urbanfix.dto.request.CheckoutRequest;
import com.urbanfix.dto.request.VerifyPaymentRequest;
import com.urbanfix.dto.response.CancelResponse;
import com.urbanfix.dto.response.CheckoutResponse;
import com.urbanfix.entity.Booking;
import com.urbanfix.entity.enums.BookingStatus;
import com.urbanfix.repository.BookingRepository;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Handles Razorpay integration: order creation, payment verification,
 * cancellation + refund. Replaces the former StripeService.
 */
@Slf4j
@Service
public class RazorpayService {

    private final BookingRepository bookingRepo;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    public RazorpayService(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    private boolean isConfigured() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }

    private RazorpayClient getClient() throws RazorpayException {
        return new RazorpayClient(keyId, keySecret);
    }

    /**
     * Create a Razorpay Order for the given booking.
     */
    public CheckoutResponse createOrder(CheckoutRequest req, Long userId) {
        try {
            Booking booking = bookingRepo.findById(Long.parseLong(req.getBookingId()))
                    .orElse(null);
            if (booking == null) return CheckoutResponse.builder().error("Booking not found").build();
            if (!booking.getCustomerId().equals(userId)) return CheckoutResponse.builder().error("Not your booking").build();
            if ("paid".equals(booking.getStripePaymentStatus())) return CheckoutResponse.builder().error("Already paid").build();
            if (booking.getStatus() == BookingStatus.cancelled) return CheckoutResponse.builder().error("Booking was cancelled").build();

            // MOCK PAYMENT FLOW if Razorpay is not configured
            if (!isConfigured()) {
                log.info("No Razorpay API keys configured. Executing MOCK payment flow for booking {}", booking.getId());
                booking.setStripeSessionId("mock_order_" + System.currentTimeMillis());
                booking.setStripePaymentStatus("paid");
                booking.setStatus(BookingStatus.confirmed);
                booking.setPaymentMethod("card");
                bookingRepo.save(booking);
                return CheckoutResponse.builder()
                        .orderId("mock_order")
                        .amount(booking.getTotalAmount() * 100)
                        .currency("INR")
                        .build();
            }

            RazorpayClient client = getClient();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", booking.getTotalAmount() * 100); // paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "booking_" + booking.getId());
            orderRequest.put("notes", new JSONObject()
                    .put("bookingId", booking.getId().toString())
                    .put("userId", userId.toString()));

            Order order = client.orders.create(orderRequest);
            String orderId = order.get("id");

            // Save the Razorpay order ID (reusing the stripeSessionId column)
            booking.setStripeSessionId(orderId);
            booking.setStripeEnvironment(keyId.startsWith("rzp_test_") ? "test" : "live");
            bookingRepo.save(booking);

            return CheckoutResponse.builder()
                    .orderId(orderId)
                    .amount(booking.getTotalAmount() * 100)
                    .currency("INR")
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation error", e);
            return CheckoutResponse.builder().error(e.getMessage()).build();
        }
    }

    /**
     * Verify the Razorpay payment signature and mark booking as paid.
     */
    @Transactional
    public CheckoutResponse verifyPayment(VerifyPaymentRequest req, Long userId) {
        try {
            Booking booking = bookingRepo.findById(Long.parseLong(req.getBookingId()))
                    .orElse(null);
            if (booking == null) return CheckoutResponse.builder().error("Booking not found").build();
            if (!booking.getCustomerId().equals(userId)) return CheckoutResponse.builder().error("Not your booking").build();
            if ("paid".equals(booking.getStripePaymentStatus())) {
                // Already verified — return success
                return CheckoutResponse.builder().orderId(req.getRazorpayOrderId()).build();
            }

            if (!isConfigured()) {
                // Mock mode — auto-verify
                booking.setStripePaymentStatus("paid");
                booking.setStatus(BookingStatus.confirmed);
                bookingRepo.save(booking);
                return CheckoutResponse.builder().orderId(req.getRazorpayOrderId()).build();
            }

            // Verify signature using Razorpay utility
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", req.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", req.getRazorpayPaymentId());
            attributes.put("razorpay_signature", req.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(attributes, keySecret);
            if (!isValid) {
                return CheckoutResponse.builder().error("Payment verification failed — invalid signature").build();
            }

            // Mark as paid
            booking.setStripePaymentStatus("paid");
            booking.setStatus(BookingStatus.confirmed);
            booking.setPaymentMethod("card");
            bookingRepo.save(booking);

            log.info("Payment verified for booking {}. Razorpay payment: {}", booking.getId(), req.getRazorpayPaymentId());
            return CheckoutResponse.builder().orderId(req.getRazorpayOrderId()).build();

        } catch (RazorpayException e) {
            log.error("Razorpay verification error", e);
            return CheckoutResponse.builder().error(e.getMessage()).build();
        }
    }

    /**
     * Cancel a booking and optionally refund via Razorpay.
     */
    @Transactional
    public CancelResponse cancelBooking(CancelBookingRequest req, Long userId) {
        try {
            Booking booking = bookingRepo.findById(Long.parseLong(req.getBookingId()))
                    .orElse(null);
            if (booking == null) return CancelResponse.builder().error("Booking not found").build();
            if (!booking.getCustomerId().equals(userId)) return CancelResponse.builder().error("Not your booking").build();
            if (booking.getStatus() == BookingStatus.cancelled) return CancelResponse.builder().error("Already cancelled").build();
            if (booking.getStatus() == BookingStatus.completed || booking.getStatus() == BookingStatus.in_progress) {
                return CancelResponse.builder().error("This booking is already in progress or completed").build();
            }
            if (!booking.getScheduledAt().isAfter(LocalDateTime.now())) {
                return CancelResponse.builder().error("Cannot cancel after the scheduled time").build();
            }

            boolean refunded = false;

            // Refund if paid by card
            if ("card".equals(booking.getPaymentMethod()) &&
                "paid".equals(booking.getStripePaymentStatus()) &&
                booking.getStripeSessionId() != null) {

                if (booking.getStripeSessionId().startsWith("mock_order_")) {
                    log.info("Mock payment found. Simulating refund for booking {}", booking.getId());
                    refunded = true;
                } else if (isConfigured()) {
                    RazorpayClient client = getClient();
                    // Fetch payments for this order and refund
                    try {
                        // Find the payment ID for this order
                        JSONObject params = new JSONObject();
                        java.util.List<Payment> payments = client.orders.fetchPayments(booking.getStripeSessionId());
                        for (Payment payment : payments) {
                            String status = payment.get("status");
                            if ("captured".equals(status)) {
                                String paymentId = payment.get("id");
                                JSONObject refundRequest = new JSONObject();
                                refundRequest.put("speed", "normal");
                                client.payments.refund(paymentId, refundRequest);
                                refunded = true;
                                break;
                            }
                        }
                    } catch (RazorpayException ex) {
                        log.warn("Failed to refund booking {} via Razorpay: {}", booking.getId(), ex.getMessage());
                    }
                }
            }

            booking.setStatus(BookingStatus.cancelled);
            if (refunded) {
                booking.setStripePaymentStatus("refunded");
            }
            bookingRepo.save(booking);

            return CancelResponse.builder().ok(true).refunded(refunded).build();

        } catch (Exception e) {
            log.error("Cancel/refund error", e);
            return CancelResponse.builder().error(e.getMessage()).build();
        }
    }
}
