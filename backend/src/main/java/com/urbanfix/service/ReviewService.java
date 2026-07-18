package com.urbanfix.service;

import com.urbanfix.dto.request.CreateReviewRequest;
import com.urbanfix.dto.response.ReviewResponse;
import com.urbanfix.entity.Booking;
import com.urbanfix.entity.Provider;
import com.urbanfix.entity.Review;
import com.urbanfix.entity.enums.BookingStatus;
import com.urbanfix.exception.BadRequestException;
import com.urbanfix.exception.ConflictException;
import com.urbanfix.exception.ForbiddenException;
import com.urbanfix.exception.ResourceNotFoundException;
import com.urbanfix.repository.BookingRepository;
import com.urbanfix.repository.ProviderRepository;
import com.urbanfix.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final BookingRepository bookingRepo;
    private final ProviderRepository providerRepo;

    public List<ReviewResponse> findAll() {
        return reviewRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public List<ReviewResponse> findByProvider(Long providerId) {
        return reviewRepo.findByProviderIdOrderByCreatedAtDesc(providerId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public ReviewResponse findByBooking(Long bookingId) {
        return reviewRepo.findByBookingId(bookingId)
                .map(ReviewResponse::from)
                .orElse(null);
    }

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest req, Long customerId) {
        Long bookingId = Long.parseLong(req.getBookingId());
        Long providerId = Long.parseLong(req.getProviderId());

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomerId().equals(customerId)) {
            throw new ForbiddenException("Not your booking");
        }
        if (booking.getStatus() != BookingStatus.completed) {
            throw new BadRequestException("Can only review completed bookings");
        }
        if (!booking.getProvider().getId().equals(providerId)) {
            throw new BadRequestException("Provider does not match booking");
        }
        if (reviewRepo.findByBookingId(bookingId).isPresent()) {
            throw new ConflictException("You've already reviewed this booking");
        }

        Review review = Review.builder()
                .bookingId(bookingId)
                .providerId(providerId)
                .customerId(customerId)
                .customerName(req.getCustomerName())
                .customerCity(req.getCustomerCity())
                .rating(req.getRating())
                .comment(req.getComment())
                .build();

        review = reviewRepo.save(review);
        recomputeProviderRating(providerId);
        
        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        Long providerId = review.getProviderId();
        
        reviewRepo.deleteById(id);
        
        // Wait for delete to flush before recalculating, but in Spring Data calling repo methods
        // in same transaction works if we query directly. We just do it after.
        recomputeProviderRating(providerId);
    }
    
    // Replaces Postgres trigger `recompute_provider_rating()`
    private void recomputeProviderRating(Long providerId) {
        List<Review> reviews = reviewRepo.findByProviderIdOrderByCreatedAtDesc(providerId);
        Provider provider = providerRepo.findById(providerId).orElse(null);
        if (provider != null) {
            int count = reviews.size();
            BigDecimal sum = BigDecimal.ZERO;
            for (Review r : reviews) {
                sum = sum.add(new BigDecimal(r.getRating()));
            }
            
            BigDecimal avg = count > 0 
                    ? sum.divide(new BigDecimal(count), 2, RoundingMode.HALF_UP) 
                    : BigDecimal.ZERO;
            
            provider.setRatingCount(count);
            provider.setRatingAvg(avg);
            providerRepo.save(provider);
        }
    }
}
