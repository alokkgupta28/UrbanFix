package com.urbanfix.service;

import com.urbanfix.entity.Provider;
import com.urbanfix.entity.ServiceCategory;
import org.springframework.stereotype.Service;

/**
 * Replicates the compute_booking_total() PostgreSQL function:
 *   ROUND((hourly_rate + (base_price * 0.15)) * 1.18)
 */
@Service
public class PricingService {

    public int computeBookingTotal(Provider provider, ServiceCategory category) {
        double visitFee = provider.getHourlyRate();
        double platformFee = category.getBasePrice() * 0.15;
        double subtotal = visitFee + platformFee;
        double withGst = subtotal * 1.18;
        return (int) Math.round(withGst);
    }
}
