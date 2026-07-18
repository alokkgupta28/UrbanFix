package com.urbanfix.service;

import com.urbanfix.dto.request.UpdateProfileRequest;
import com.urbanfix.dto.response.ProfileResponse;
import com.urbanfix.entity.Profile;
import com.urbanfix.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository repo;

    public ProfileResponse findById(Long userId) {
        return repo.findById(userId)
                .map(ProfileResponse::from)
                .orElse(null);
    }

    @Transactional
    public ProfileResponse upsert(Long userId, UpdateProfileRequest req) {
        Profile profile = repo.findById(userId).orElseGet(() -> {
            Profile p = new Profile();
            p.setId(userId);
            return p;
        });
        profile.setFullName(req.getFullName());
        profile.setPhone(req.getPhone());
        profile.setCity(req.getCity() != null && !req.getCity().isBlank()
                ? req.getCity() : null);
        return ProfileResponse.from(repo.save(profile));
    }
}
