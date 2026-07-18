package com.urbanfix.repository;

import com.urbanfix.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProviderRepository extends JpaRepository<Provider, Long> {

    List<Provider> findAllByOrderByRatingAvgDesc();

    Optional<Provider> findByUserId(Long userId);
}
