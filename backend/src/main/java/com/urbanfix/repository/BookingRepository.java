package com.urbanfix.repository;

import com.urbanfix.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByCustomerIdOrderByScheduledAtDesc(Long customerId);

    List<Booking> findByProviderIdOrderByScheduledAtDesc(Long providerId);
}
