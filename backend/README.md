# UrbanFix Spring Boot Backend

This is the Spring Boot REST API for UrbanFix, replacing the legacy TanStack Start server functions.

## Architecture

This backend implements **Strategy B** (Backend for Backend Concerns).
- The frontend continues to use `@supabase/supabase-js` to communicate directly with Supabase for standard CRUD operations (categories, providers, bookings, profiles, reviews). Row-Level Security (RLS) is preserved.
- This Spring Boot application handles all server-side operations that require a trusted environment:
  - **Stripe Checkout & Refunds**: Uses Stripe Java SDK and secret keys.
  - **Stripe Webhooks**: Listens for Stripe events to update booking payment statuses.
  - **Pricing Computation**: Server-side calculation of platform fees and GST.
  - **Admin Operations**: Validates admin roles and allows overriding RLS constraints.

## Tech Stack
- **Java 21**
- **Spring Boot 3.4**
- **Spring Data JPA** (Hibernate)
- **Spring Security** (Stateless JWT auth)
- **PostgreSQL Driver** (Connecting to Supabase pooler)
- **Stripe Java SDK**

## Requirements

1. Java 21+ installed
2. Maven 3.9+ installed
3. Supabase Project (database and auth)
4. Stripe Account (sandbox/live keys)

## Environment Variables

Create a `application-dev.properties` (or set environment variables) with your secrets:

```properties
SUPABASE_DB_URL=jdbc:postgresql://aws-0-[REGION].pooler.supabase.com:6543/postgres
SUPABASE_DB_USERNAME=postgres.[PROJECT_REF]
SUPABASE_DB_PASSWORD=your-db-password
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

STRIPE_SANDBOX_API_KEY=sk_test_...
STRIPE_LIVE_API_KEY=sk_live_...
PAYMENTS_SANDBOX_WEBHOOK_SECRET=whsec_...
PAYMENTS_LIVE_WEBHOOK_SECRET=whsec_...
```

## Running the Application

```bash
# Compile and package
mvn clean package -DskipTests

# Run locally (defaults to port 8080)
mvn spring-boot:run
```

## Frontend Integration

The frontend has been updated in `src/lib/booking.functions.ts` to call this backend (`http://localhost:8080`) for Stripe checkout and cancellation. All requests must include the Supabase JWT in the `Authorization: Bearer <token>` header.
