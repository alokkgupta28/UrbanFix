<div align="center">
  <img src="public/favicon.svg" alt="UrbanFix Logo" width="120" />
  <h1>UrbanFix</h1>
  <p>
    <em>A modern, trusted platform for booking vetted home service professionals like electricians, plumbers, cleaners, and salon experts.</em>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203.4-6DB33F?logo=spring&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Payments-Razorpay-02042B?logo=razorpay&logoColor=white" alt="Razorpay" />
  </p>
</div>

<hr />

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API & Integration](#-api--integration)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 About the Project
UrbanFix bridges the gap between skilled home service professionals and customers needing reliable home maintenance. Built with a highly scalable, decoupled architecture, the platform guarantees a seamless booking experience and stringent security via robust server-side payment verification and custom role-based access.

## ✨ Features
- **Role-Based Access**: Specialized views and administrative capabilities for Customers, Providers, and Admins.
- **Service Categories**: Browse various home maintenance and repair services with transparent, upfront pricing.
- **Booking & Scheduling**: Frictionless scheduling workflows for securing appointments.
- **Secure Payments**: Complete integration with Razorpay for rapid checkouts, seamless payments, and robust transaction verification.
- **Reviews & Ratings**: Verified customer reviews that maintain high quality and trust standards for service providers.
- **Admin Dashboard**: Comprehensive moderation tools, platform configuration, and dispute management interface.

## 🏗️ Architecture & Tech Stack

### Frontend (Client)
- **Framework**: React 19, TanStack Start, and Vite.
- **Styling**: Tailwind CSS configured with `shadcn/ui` components built on Radix UI primitives.
- **State & Data Fetching**: TanStack React Query and Axios.
- **Authentication**: JWT-based auth via React Context API, persisting secure tokens in Local Storage.
- **Payments**: Razorpay Checkout SDK operating through a client-side modal.

### Backend (Server)
- **Framework**: Spring Boot 3.4 (Java 17).
- **Database**: MySQL managed via Spring Data JPA and Hibernate.
- **Authentication**: Spring Security with JJWT for stateless token generation and robust validation.
- **Payments**: Razorpay Java SDK for order creation and secure server-side cryptographic signature verification.
- **Storage**: Highly optimized local file storage service for handling user and provider image uploads.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- **Node.js** (v18 or higher)
- **Java 17+** and **Maven 3.9+**
- **MySQL Server** (running locally or remotely)
- **Razorpay Account** (Sandbox/Test mode API keys required)

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a MySQL database named `urbanfix`.
3. Configure your environment variables in `src/main/resources/application.properties` (or export them in your terminal):
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
4. Build and run the Spring Boot application:
   ```bash
   mvn clean package -DskipTests
   mvn spring-boot:run
   ```
   *The backend API will start on `http://localhost:8080`.*

### Frontend Setup

1. Open a new terminal and navigate to the project root:
   ```bash
   cd ..
   ```
2. Create a `.env` file at the root to configure the API and Razorpay variables:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_RAZORPAY_KEY_ID=rzp_test_...
   ```
3. Install dependencies and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
   *The client application will be available at `http://localhost:5173`.*

## 🔌 API & Integration

The frontend operates entirely autonomously from the data layer, strictly relying on the Spring Boot REST API for all data requirements (`http://localhost:8080/api`). 

- **Protected Routes**: All secured requests dynamically append the user's JWT into the `Authorization: Bearer <token>` header, handled globally via Axios interceptors in `src/lib/api.ts`.
- **Payment Flow**: When a booking is finalized, the backend explicitly creates a Razorpay Order ID. The frontend utilizes this Order ID to open the native Razorpay Checkout modal. Upon a successful charge, the frontend securely dispatches the Razorpay signature back to the backend for cryptographic verification before marking the booking as completed.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is proprietary and confidential. Unauthorized copying of this project, via any medium, is strictly prohibited.
