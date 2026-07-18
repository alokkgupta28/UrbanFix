package com.urbanfix.service;

import com.urbanfix.dto.request.CreateBookingRequest;
import com.urbanfix.dto.request.UpdateBookingStatusRequest;
import com.urbanfix.dto.response.BookingResponse;
import com.urbanfix.entity.Booking;
import com.urbanfix.entity.Provider;
import com.urbanfix.entity.ServiceCategory;
import com.urbanfix.entity.User;
import com.urbanfix.entity.enums.BookingStatus;
import com.urbanfix.exception.BadRequestException;
import com.urbanfix.exception.ForbiddenException;
import com.urbanfix.exception.ResourceNotFoundException;
import com.urbanfix.repository.BookingRepository;
import com.urbanfix.repository.ProviderRepository;
import com.urbanfix.repository.ServiceCategoryRepository;
import com.urbanfix.repository.UserRepository;
import com.urbanfix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository repo;
    private final ProviderRepository providerRepo;
    private final ServiceCategoryRepository categoryRepo;
    private final UserRepository userRepo;
    private final PricingService pricingService;

    public List<BookingResponse> findAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(BookingResponse::from)
                .toList();
    }

    public List<BookingResponse> findByCustomer(Long customerId) {
        return repo.findByCustomerIdOrderByScheduledAtDesc(customerId).stream()
                .map(BookingResponse::from)
                .toList();
    }

    public List<BookingResponse> findByProvider(Long providerId) {
        return repo.findByProviderIdOrderByScheduledAtDesc(providerId).stream()
                .map(BookingResponse::from)
                .toList();
    }

    public BookingResponse findById(Long id, AuthenticatedUser user) {
        Booking booking = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!hasAccess(booking, user)) {
            throw new ForbiddenException("Not authorized to view this booking");
        }

        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest req, AuthenticatedUser user) {
        Long providerId = Long.parseLong(req.getProviderId());
        Long categoryId = Long.parseLong(req.getCategoryId());

        Provider provider = providerRepo.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        ServiceCategory category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!provider.getCategory().getId().equals(category.getId())) {
            throw new BadRequestException("Provider does not offer this category of service");
        }

        // Replicates Postgres validate_booking() logic
        LocalDateTime scheduledAt = LocalDateTime.parse(req.getScheduledAt(), DateTimeFormatter.ISO_DATE_TIME);
        if (scheduledAt.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot schedule a booking in the past");
        }

        // Compute total amount (15% platform fee + 18% GST)
        int totalAmount = pricingService.computeBookingTotal(provider, category);

        Booking booking = Booking.builder()
                .customerId(user.getUserId())
                .provider(provider)
                .category(category)
                .scheduledAt(scheduledAt)
                .addressLine(req.getAddressLine())
                .addressCity(req.getAddressCity())
                .addressPincode(req.getAddressPincode())
                .notes(req.getNotes())
                .contactPhone(req.getContactPhone())
                .status(BookingStatus.pending)
                .totalAmount(totalAmount)
                .paymentMethod(req.getPaymentMethod())
                .stripePaymentStatus(req.getPaymentMethod().equals("pay_after") ? "unpaid" : "pending")
                .disputed(false)
                .build();

        return BookingResponse.from(repo.save(booking));
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String reason, AuthenticatedUser user) {
        Booking booking = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!hasAccess(booking, user)) {
            throw new ForbiddenException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.completed || booking.getStatus() == BookingStatus.cancelled) {
            throw new BadRequestException("Cannot cancel a completed or already cancelled booking");
        }

        booking.setStatus(BookingStatus.cancelled);
        booking.setNotes((booking.getNotes() != null ? booking.getNotes() + "\n" : "") + "Cancel reason: " + reason);
        return BookingResponse.from(repo.save(booking));
    }

    @Transactional
    public BookingResponse updateStatus(Long id, UpdateBookingStatusRequest req, AuthenticatedUser user) {
        Booking booking = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Only provider or admin can update status freely. Customer can only cancel
        // (handled above).
        if (user.getRoles() == null || !user.getRoles().contains("admin")) {
            if (!booking.getProvider().getUserId().equals(user.getUserId())) {
                throw new ForbiddenException("Not authorized to update status");
            }
        }

        BookingStatus newStatus = BookingStatus.valueOf(req.getStatus().toLowerCase());

        // Update provider jobs_completed if status changes to completed
        if (newStatus == BookingStatus.completed && booking.getStatus() != BookingStatus.completed) {
            Provider provider = booking.getProvider();
            provider.setJobsCompleted(provider.getJobsCompleted() + 1);
            providerRepo.save(provider);
        }

        booking.setStatus(newStatus);
        return BookingResponse.from(repo.save(booking));
    }

    @Transactional
    public BookingResponse reportDispute(Long id, String reason, AuthenticatedUser user) {
        Booking booking = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!hasAccess(booking, user)) {
            throw new ForbiddenException("Not authorized to view this booking");
        }

        booking.setDisputed(true);
        booking.setDisputeReason(reason);
        return BookingResponse.from(repo.save(booking));
    }

    @Transactional
    public BookingResponse adminUpdate(Long id, com.urbanfix.dto.request.AdminUpdateBookingRequest req, AuthenticatedUser user) {
        Booking booking = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (user.getRoles() == null || !user.getRoles().contains("admin")) {
            throw new ForbiddenException("Only admins can perform this action");
        }

        if (req.getDisputed() != null) {
            booking.setDisputed(req.getDisputed());
        }
        if (req.getAdminNotes() != null) {
            booking.setAdminNotes(req.getAdminNotes());
        }

        return BookingResponse.from(repo.save(booking));
    }

    private boolean hasAccess(Booking booking, AuthenticatedUser user) {
        return booking.getCustomerId().equals(user.getUserId())
                || (booking.getProvider().getUserId() != null
                        && booking.getProvider().getUserId().equals(user.getUserId()))
                || (user.getRoles() != null && user.getRoles().contains("admin"));
    }
}
