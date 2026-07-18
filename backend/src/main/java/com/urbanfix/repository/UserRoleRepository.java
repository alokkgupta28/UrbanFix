package com.urbanfix.repository;

import com.urbanfix.entity.UserRole;
import com.urbanfix.entity.enums.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    boolean existsByUserIdAndRole(Long userId, AppRole role);

    List<UserRole> findAllByOrderByCreatedAtDesc();

    List<UserRole> findByUserId(Long userId);
}
