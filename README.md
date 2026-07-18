# UrbanFix Local Connect

UrbanFix is a modern, trusted platform for booking vetted home service professionals like electricians, plumbers, cleaners, and salon experts.

This project is built using a modern decoupled architecture:
- **Frontend**: A dynamic React application built with TanStack Start, Vite, and Tailwind CSS.
- **Backend**: A secure Spring Boot REST API for handling business logic, payments, and authentication.

## ✨ Features

- **Role-Based Access**: Specialized views and capabilities for Customers, Providers, and Admins.
- **Service Categories**: Browse various home maintenance and repair services with transparent pricing.
- **Booking & Scheduling**: Seamless booking flows for scheduling appointments with professionals.
- **Secure Payments**: Razorpay integration for seamless checkouts, payments, and verifications.
- **Reviews & Ratings**: Verified customer reviews to maintain quality standards for service providers.
- **Admin Dashboard**: Moderation tools, platform configuration, and management interface.

## 🏗️ Architecture & Tech Stack

### Frontend (Client)
- **Framework**: React 19, TanStack Start, and Vite.
- **Styling**: Tailwind CSS with `shadcn/ui` components (Radix UI primitives).
- **State & Data Fetching**: TanStack React Query and Axios.
- **Authentication**: JWT-based auth via Context API, persisting tokens in Local Storage.
- **Payments**: Razorpay Checkout SDK (client-side modal).

### Backend (Server)
- **Framework**: Spring Boot 3.4 (Java 17).
- **Database**: MySQL managed via Spring Data JPA and Hibernate.
- **Authentication**: Spring Security with JJWT for stateless token generation and validation.
- **Payments**: Razorpay Java SDK for order creation and secure server-side signature verification.
- **Storage**: Local file storage service for handling user and provider uploads.

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+) for the frontend.
2. **Java 17+** and **Maven 3.9+** for the backend.
3. **MySQL Server** (running locally or remote).
4. **Razorpay Account** (Sandbox/Test mode API keys).

### Running the Backend

Navigate to the `backend` directory:
```bash
cd backend
```

Create a MySQL database named `urbanfix`. Then, configure your environment variables in `src/main/resources/application.properties` (or export them in your terminal):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/urbanfix?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your-mysql-password

# Generate a strong, random 256-bit key for JWT signing
jwt.secret=your-jwt-secret-key-that-is-at-least-256-bits

# Your Razorpay Test Keys
razorpay.key-id=rzp_test_...
razorpay.key-secret=your-razorpay-secret

# Directory for file uploads (created automatically)
app.upload.dir=uploads
```

Build and run the application:
```bash
mvn clean package -DskipTests
mvn spring-boot:run
```
The backend server will start on `http://localhost:8080`.

### Running the Frontend

Navigate back to the project root:
```bash
cd ..
```

Create a `.env` file at the root to configure the API and Razorpay:
```env
VITE_API_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

Install dependencies and start the Vite development server:
```bash
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## 🔌 API & Integration

The frontend completely relies on the Spring Boot REST API for all data requirements (`http://localhost:8080/api`). 

- **Protected Routes**: All protected requests append the user's JWT in the `Authorization: Bearer <token>` header (handled globally via Axios interceptors in `src/lib/api.ts`).
- **Payments**: When a booking is finalized, the backend creates a Razorpay Order ID. The frontend uses this Order ID to open the Razorpay Checkout modal. Upon success, the frontend sends the Razorpay signature back to the backend for cryptographic verification before marking the booking as paid.
