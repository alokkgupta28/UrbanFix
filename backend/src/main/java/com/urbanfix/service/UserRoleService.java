package com.urbanfix.service;

import com.urbanfix.dto.response.UserRoleResponse;
import com.urbanfix.entity.UserRole;
import com.urbanfix.entity.enums.AppRole;
import com.urbanfix.exception.ConflictException;
import com.urbanfix.exception.ResourceNotFoundException;
import com.urbanfix.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserRoleService {

    private final UserRoleRepository repo;

    public boolean isAdmin(Long userId) {
        return repo.existsByUserIdAndRole(userId, AppRole.admin);
    }

    public List<UserRoleResponse> findAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(UserRoleResponse::from)
                .toList();
    }

    @Transactional
    public UserRoleResponse grantRole(String userIdStr, String roleStr) {
        Long userId = Long.parseLong(userIdStr);
        AppRole role = AppRole.valueOf(roleStr);

        if (repo.existsByUserIdAndRole(userId, role)) {
            throw new ConflictException("User already has this role");
        }

        UserRole ur = UserRole.builder()
                .userId(userId)
                .role(role)
                .build();
        return UserRoleResponse.from(repo.save(ur));
    }

    @Transactional
    public void revokeRole(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Role assignment not found");
        }
        repo.deleteById(id);
    }
}
