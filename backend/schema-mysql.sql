-- ==========================================
-- UrbanFix MySQL Schema
-- ==========================================

-- 1. users (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. profiles
CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(255),
    avatar_url VARCHAR(500),
    city VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. service_categories
CREATE TABLE IF NOT EXISTS service_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_price INT NOT NULL,
    icon_key VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. providers
CREATE TABLE IF NOT EXISTS providers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    hourly_rate INT NOT NULL,
    experience_years INT NOT NULL,
    rating_avg DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    rating_count INT NOT NULL DEFAULT 0,
    jobs_completed INT NOT NULL DEFAULT 0,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    avatar_key VARCHAR(255) NOT NULL,
    languages JSON NOT NULL,
    phone VARCHAR(255),
    user_id BIGINT UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_providers_category FOREIGN KEY (category_id) REFERENCES service_categories(id),
    CONSTRAINT fk_providers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. bookings
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    address_city VARCHAR(255) NOT NULL,
    address_pincode VARCHAR(255) NOT NULL,
    notes TEXT,
    contact_phone VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount INT NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR(255),
    stripe_payment_status VARCHAR(255) NOT NULL DEFAULT 'unpaid',
    stripe_environment VARCHAR(255),
    disputed TINYINT(1) NOT NULL DEFAULT 0,
    dispute_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_provider FOREIGN KEY (provider_id) REFERENCES providers(id),
    CONSTRAINT fk_bookings_category FOREIGN KEY (category_id) REFERENCES service_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. reviews
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    booking_id BIGINT UNIQUE,
    customer_id BIGINT,
    customer_name VARCHAR(255) NOT NULL,
    customer_city VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_provider FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- Seed Data: Service Categories
-- ==========================================
INSERT INTO service_categories (slug, name, tagline, description, base_price, icon_key, sort_order) VALUES
('ac-repair', 'AC Repair & Service', 'Beat the heat — expert cooling solutions', 'Complete AC servicing including deep cleaning, gas refill, compressor repair, and installation for all brands.', 499, 'snowflake', 1),
('electrician', 'Electrician', 'Safe wiring. Bright spaces.', 'Licensed electricians for fan installation, switchboard repair, wiring, MCB trips, inverter setup, and more.', 299, 'zap', 2),
('plumber', 'Plumber', 'Leak-free living, guaranteed', 'Expert plumbing for tap repair, pipe fitting, toilet installation, water tank cleaning, and drainage solutions.', 249, 'droplets', 3),
('cleaning', 'Home Cleaning', 'Spotless homes, happy families', 'Professional deep cleaning, bathroom cleaning, kitchen cleaning, sofa shampooing, and full-home sanitisation.', 399, 'sparkles', 4),
('salon', 'Salon at Home', 'Pamper yourself at home', 'Certified beauticians for haircuts, facials, waxing, manicure-pedicure, bridal packages, and more.', 349, 'scissors', 5),
('appliance', 'Appliance Repair', 'Fix it right, the first time', 'Repair services for washing machines, refrigerators, microwaves, water purifiers, chimneys, and geysers.', 349, 'settings', 6);
