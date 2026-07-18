package com.urbanfix.controller;

import com.urbanfix.dto.request.UpdateProfileRequest;
import com.urbanfix.dto.response.ProfileResponse;
import com.urbanfix.security.AuthenticatedUser;
import com.urbanfix.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal AuthenticatedUser user) {
        ProfileResponse p = profileService.findById(user.getUserId());
        if (p == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(p);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest req, @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(profileService.upsert(user.getUserId(), req));
    }
}
