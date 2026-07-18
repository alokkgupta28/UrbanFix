# UrbanFix Local Connect

UrbanFix is a modern, trusted platform for booking vetted home service professionals like electricians, plumbers, cleaners, and salon experts.

This project uses a separated architecture:
- **Frontend**: A React application built with TanStack Start, Vite, and Tailwind CSS.
- **Backend**: A robust Spring Boot REST API for handling secure operations, payments, and admin functionality.

## 🏗️ Architecture overview

**Frontend (Client)**: 
- Provides a responsive and interactive user interface for browsing services and managing bookings.
- Communicates securely with the Spring Boot backend using JWT-based authentication.

**Backend (Server)**:
- A Spring Boot application connected to a MySQL database.
- Handles all server-side operations that require a trusted environment:
  - **Authentication**: Custom JWT-based auth system for user and provider accounts.
  - **Razorpay Integration**: Handles secure checkout, payments, and payment verification via Razorpay.
  - **Pricing Computation**: Server-side calculation of platform fees and GST.
  - **Admin Operations**: Validates admin roles and manages data integrity.

## 🚀 Getting Started

### Prerequisites

1. Node.js (for frontend)
2. Java 21+ and Maven 3.9+ (for backend)
3. MySQL Database
4. Razorpay Account (for payment gateway keys)

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
spring.datasource.url=jdbc:mysql://localhost:3306/urbanfix
spring.datasource.username=root
spring.datasource.password=your-mysql-password

jwt.secret=your-jwt-secret-key-that-is-at-least-256-bits

razorpay.key.id=rzp_test_...
razorpay.key.secret=your-razorpay-secret
```

### Frontend Configuration

Ensure you have a `.env` file at the project root with the necessary API URLs and public keys required by the application (e.g., your Razorpay public key ID).

## 🔌 Frontend Integration

The frontend seamlessly integrates with the Spring Boot backend (`http://localhost:8080`) for operations like Razorpay checkout, fetching service categories, and managing user profiles. All protected requests to the backend include the user's JWT in the `Authorization: Bearer <token>` header to maintain strict authentication.
