package com.urbanfix.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Service category (e.g. AC Repair, Plumber, Electrician).
 * Seed data is loaded from schema-mysql.sql.
 */
@Entity
@Table(name = "service_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String tagline;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", nullable = false)
    private Integer basePrice;

    @Column(name = "icon_key", nullable = false)
    private String iconKey;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
