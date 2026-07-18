package com.urbanfix.service;

import com.urbanfix.dto.response.ProviderResponse;
import com.urbanfix.entity.Booking;
import com.urbanfix.entity.Provider;
import com.urbanfix.entity.enums.BookingStatus;
import com.urbanfix.exception.ConflictException;
import com.urbanfix.exception.ResourceNotFoundException;
import com.urbanfix.repository.BookingRepository;
import com.urbanfix.repository.ProviderRepository;
import com.urbanfix.repository.UserRoleRepository;
import com.urbanfix.entity.UserRole;
import com.urbanfix.entity.enums.AppRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepository repo;
    private final BookingRepository bookingRepo;
    private final UserRoleRepository roleRepo;

    public List<ProviderResponse> findAll() {
        return repo.findAllByOrderByRatingAvgDesc().stream()
                .map(ProviderResponse::from)
                .toList();
    }

    public ProviderResponse findById(Long id) {
        return ProviderResponse.from(getEntity(id));
    }

    public ProviderResponse findByUserId(Long userId) {
        return repo.findByUserId(userId)
                .map(ProviderResponse::from)
                .orElse(null);
    }

    /**
     * Returns provider phone only if the caller is the provider, an admin,
     * or has a confirmed/in_progress/completed booking with that provider.
     */
    public String getProviderPhone(Long providerId, Long callerId) {
        Provider provider = getEntity(providerId);

        // Provider themselves
        if (provider.getUserId() != null && provider.getUserId().equals(callerId)) {
            return provider.getPhone();
        }
        // Admin
        if (roleRepo.existsByUserIdAndRole(callerId, AppRole.admin)) {
            return provider.getPhone();
        }
        // Has a qualifying booking
        List<Booking> bookings = bookingRepo.findByProviderIdOrderByScheduledAtDesc(providerId);
        boolean hasQualifyingBooking = bookings.stream().anyMatch(b ->
                b.getCustomerId().equals(callerId) &&
                (b.getStatus() == BookingStatus.confirmed ||
                 b.getStatus() == BookingStatus.in_progress ||
                 b.getStatus() == BookingStatus.completed));
        if (hasQualifyingBooking) {
            return provider.getPhone();
        }
        return null;
    }

    @Transactional
    public ProviderResponse claimProvider(Long providerId, Long userId) {
        Provider provider = getEntity(providerId);
        if (provider.getUserId() != null) {
            throw new ConflictException("This profile has already been claimed");
        }
        // Check user doesn't already have a provider
        if (repo.findByUserId(userId).isPresent()) {
            throw new ConflictException("You already have a provider profile");
        }
        provider.setUserId(userId);
        repo.save(provider);
        
        if (!roleRepo.existsByUserIdAndRole(userId, AppRole.provider)) {
            UserRole role = UserRole.builder()
                    .userId(userId)
                    .role(AppRole.provider)
                    .build();
            roleRepo.save(role);
        }
        
        return ProviderResponse.from(provider);
    }

    @Transactional
    public ProviderResponse updateProvider(Long id, Boolean verified, String userId) {
        Provider provider = getEntity(id);
        if (verified != null) provider.setVerified(verified);
        if (userId != null) {
            provider.setUserId(userId.isBlank() ? null : Long.parseLong(userId));
        }
        return ProviderResponse.from(repo.save(provider));
    }

    @Transactional
    public void deleteProvider(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Provider not found");
        }
        repo.deleteById(id);
    }

    public Provider getEntity(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
    }
}
