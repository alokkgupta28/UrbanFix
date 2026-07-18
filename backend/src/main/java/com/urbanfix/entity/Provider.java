package com.urbanfix.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Service provider / technician profile.
 * Languages stored as JSON string (MySQL JSON column).
 */
@Entity
@Table(name = "providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String headline;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false)
    private String city;

    @Column(name = "hourly_rate", nullable = false)
    private Integer hourlyRate;

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @Column(name = "rating_avg", nullable = false, precision = 5, scale = 2)
    private BigDecimal ratingAvg;

    @Column(name = "rating_count", nullable = false)
    private Integer ratingCount;

    @Column(name = "jobs_completed", nullable = false)
    private Integer jobsCompleted;

    @Column(nullable = false)
    private Boolean verified;

    @Column(name = "avatar_key", nullable = false)
    private String avatarKey;

    /** Stored as JSON array string, e.g. '["English","Hindi"]' */
    @Column(nullable = false, columnDefinition = "JSON")
    private String languages;

    private String phone;

    @Column(name = "user_id", unique = true)
    private Long userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
