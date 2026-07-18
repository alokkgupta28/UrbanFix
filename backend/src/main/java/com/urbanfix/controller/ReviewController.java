package com.urbanfix.controller;

import com.urbanfix.dto.request.CreateReviewRequest;
import com.urbanfix.dto.response.ReviewResponse;
import com.urbanfix.security.AuthenticatedUser;
import com.urbanfix.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.findAll());
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewResponse>> getProviderReviews(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.findByProvider(providerId));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ReviewResponse> getBookingReview(@PathVariable Long bookingId) {
        ReviewResponse r = reviewService.findByBooking(bookingId);
        if (r == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(r);
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest req, @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(reviewService.createReview(req, user.getUserId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
