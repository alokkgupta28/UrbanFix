-- ==========================================
-- Supabase PostgreSQL Schema
-- Generated from JPA Entities
-- ==========================================

-- 1. Custom Types / Enums
CREATE TYPE app_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- 2. profiles
-- PK references auth.users(id) — managed by Supabase Auth trigger.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(255),
    avatar_url VARCHAR(255),
    city VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. user_roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 4. service_categories
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_price INTEGER NOT NULL,
    icon_key VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. providers
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES service_categories(id),
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    hourly_rate INTEGER NOT NULL,
    experience_years INTEGER NOT NULL,
    rating_avg NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    jobs_completed INTEGER NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_key VARCHAR(255) NOT NULL,
    languages TEXT[] NOT NULL,
    phone VARCHAR(255),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id),
    category_id UUID NOT NULL REFERENCES service_categories(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    address_city VARCHAR(255) NOT NULL,
    address_pincode VARCHAR(255) NOT NULL,
    notes TEXT,
    contact_phone VARCHAR(255) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    total_amount INTEGER NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR(255),
    stripe_payment_status VARCHAR(255) NOT NULL,
    stripe_environment VARCHAR(255),
    disputed BOOLEAN NOT NULL DEFAULT FALSE,
    dispute_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_city VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
