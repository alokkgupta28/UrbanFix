package com.urbanfix.repository;

import com.urbanfix.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findAllByOrderByCreatedAtDesc();

    List<Review> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    Optional<Review> findByBookingId(Long bookingId);
}
