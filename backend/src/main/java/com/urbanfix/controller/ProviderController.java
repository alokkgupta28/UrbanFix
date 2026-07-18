package com.urbanfix.controller;

import com.urbanfix.dto.request.UpdateProviderRequest;
import com.urbanfix.dto.response.ProviderResponse;
import com.urbanfix.security.AuthenticatedUser;
import com.urbanfix.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @GetMapping
    public ResponseEntity<List<ProviderResponse>> getProviders() {
        return ResponseEntity.ok(providerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderResponse> getProvider(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.findById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<ProviderResponse> getMyProvider(@AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) return ResponseEntity.status(401).build();
        ProviderResponse p = providerService.findByUserId(user.getUserId());
        if (p == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(p);
    }

    @GetMapping("/{id}/phone")
    public ResponseEntity<String> getProviderPhone(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) return ResponseEntity.status(401).build();
        String phone = providerService.getProviderPhone(id, user.getUserId());
        if (phone == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(phone);
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<ProviderResponse> claimProvider(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(providerService.claimProvider(id, user.getUserId()));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProviderResponse> updateProvider(@PathVariable Long id, @RequestBody UpdateProviderRequest req) {
        return ResponseEntity.ok(providerService.updateProvider(id, req.getVerified(), req.getUserId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
        return ResponseEntity.noContent().build();
    }
}
