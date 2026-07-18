# UrbanFix Local Connect

UrbanFix is a modern, trusted platform for booking vetted home service professionals like electricians, plumbers, cleaners, and salon experts.

This project uses a separated architecture:
- **Frontend**: A React application built with TanStack Start, Vite, and Tailwind CSS.
- **Backend**: A robust Spring Boot REST API for handling secure operations, payments, and admin functionality.

## 🏗️ Architecture overview

**Frontend (Client)**: 
- Continues to use `@supabase/supabase-js` to communicate directly with Supabase for standard CRUD operations (categories, providers, bookings, profiles, reviews). 
- Row-Level Security (RLS) is preserved and enforced by Supabase.

**Backend (Server)**:
- A Spring Boot application (Strategy B - Backend for Backend Concerns).
- Handles all server-side operations that require a trusted environment:
  - **Stripe Checkout & Refunds**: Uses Stripe Java SDK and secret keys.
  - **Stripe Webhooks**: Listens for Stripe events to update booking payment statuses.
  - **Pricing Computation**: Server-side calculation of platform fees and GST.
  - **Admin Operations**: Validates admin roles and allows overriding RLS constraints.

## 🚀 Getting Started

### Prerequisites

1. Node.js (for frontend)
2. Java 21+ and Maven 3.9+ (for backend)
3. Supabase Project (database and auth)
4. Stripe Account (sandbox/live keys)

### Running the Frontend

Navigate to the project root and start the Vite development server:
```bash
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

### Running the Backend

Navigate to the `backend` directory:
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```
The backend server runs locally on port 8080.

## 🔑 Environment Variables

### Backend Configuration

Create an `application-dev.properties` file in `backend/src/main/resources` (or set environment variables) with your secrets:

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

### Frontend Configuration

Ensure you have a `.env` file at the project root with the necessary Supabase and VITE prefixed public keys required by the application.

## 🔌 Frontend Integration

The frontend seamlessly integrates with the Spring Boot backend (`http://localhost:8080`) for operations like Stripe checkout and booking cancellations (e.g. in `src/lib/booking.functions.ts`). All requests to the backend include the user's Supabase JWT in the `Authorization: Bearer <token>` header to maintain strict authentication.
