<div align="center">

<img src="public/favicon.svg" width="120" alt="UrbanFix Logo">

# UrbanFix

### Professional Home Service Booking Platform

Book trusted home service professionals including electricians, plumbers, AC technicians, carpenters, painters, cleaners, salon experts and more through a secure, modern and user-friendly platform.

<p>

<img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk">
<img src="https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?logo=springboot">
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react">
<img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql">
<img src="https://img.shields.io/badge/JWT-Authentication-black">
<img src="https://img.shields.io/badge/Razorpay-Payments-02042B?logo=razorpay">
<img src="https://img.shields.io/badge/License-MIT-blue">

</p>

### 🌐 Live Demo

**Frontend:** https://urbanfix-peach.vercel.app/

**Backend API:** https://urbanfix-9il0.onrender.com

</div>

---

# 📖 Overview

UrbanFix is a full-stack home service booking platform.

The platform connects customers with verified service professionals while providing secure booking, online payments, booking management, reviews, and role-based dashboards.

The application follows a scalable client-server architecture using React for the frontend and Spring Boot for the backend with JWT authentication and PostgreSQL as the database.

---

# ✨ Features

## 👤 Customer

- User Registration & Login
- JWT Authentication
- Browse Service Categories
- View Professional Profiles
- Book Home Services
- Secure Razorpay Payments
- Booking History
- Rate & Review Providers
- Profile Management

---

## 👨‍🔧 Provider

- Provider Login
- Provider Dashboard
- Manage Bookings
- Update Booking Status
- View Customer Reviews
- Profile Management

---

## 👨‍💼 Admin

- Admin Dashboard
- Manage Categories
- Manage Providers
- Manage Customers
- Monitor Bookings
- Platform Analytics

---

## 🔐 Security

- Spring Security
- JWT Authentication
- BCrypt Password Encryption
- Role-Based Authorization
- Secure REST APIs
- Razorpay Signature Verification

---

# 🏗️ System Architecture

```mermaid
flowchart LR

A[React + Vite]

B[Spring Boot REST API]

C[Spring Security]

D[JWT Authentication]

E[Service Layer]

F[Spring Data JPA]

G[(PostgreSQL)]

A --> B
B --> C
C --> D
D --> E
E --> F
F --> G
```

---

# 🛠 Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React 19 |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Spring Boot 3 |
| Language | Java 17 |
| Security | Spring Security |
| Authentication | JWT |
| ORM | Hibernate / Spring Data JPA |
| Database | PostgreSQL (Neon) |
| Payments | Razorpay |
| Build Tool | Maven |
| Deployment | Vercel + Render |

---

# 📂 Project Structure

```
UrbanFix
│
├── frontend
│   ├── src
│   ├── assets
│   ├── components
│   ├── context
│   ├── hooks
│   ├── pages
│   ├── services
│   └── utils
│
├── backend
│   ├── config
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   ├── security
│   ├── service
│   ├── exception
│   └── util
│
└── README.md
```

---

# 🔐 Authentication Flow

```mermaid
sequenceDiagram

Customer->>Frontend: Login

Frontend->>Backend: Email & Password

Backend->>Spring Security: Authenticate

Spring Security->>JWT: Generate Token

JWT-->>Frontend: Access Token

Frontend->>Backend: Bearer Token

Backend-->>Frontend: Protected Resources
```

---

# 🗄 Database

### Main Tables

- users
- user_roles
- profiles
- providers
- service_categories
- bookings
- reviews

---

# 🔌 REST API

## Authentication

| Method | Endpoint |
|----------|-----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |

---

## Categories

| Method | Endpoint |
|----------|-----------|
| GET | /api/categories |

---

## Providers

| Method | Endpoint |
|----------|-----------|
| GET | /api/providers |
| GET | /api/providers/{id} |

---

## Bookings

| Method | Endpoint |
|----------|-----------|
| POST | /api/bookings |
| GET | /api/bookings |
| PUT | /api/bookings/{id} |

---

## Payments

| Method | Endpoint |
|----------|-----------|
| POST | /api/payments/create-order |
| POST | /api/payments/verify |

---

# 🚀 Local Installation

## Clone Repository

```bash
git clone https://github.com/alokkgupta28/urbanfix.git

cd urbanfix
```

---

## Backend

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

### Backend Environment Variables

```
DATABASE_URL

DATABASE_USERNAME

DATABASE_PASSWORD

JWT_SECRET

RAZORPAY_KEY_ID

RAZORPAY_KEY_SECRET
```

---

## Frontend

```bash
npm install

npm run dev
```

### Frontend Environment Variables

```
VITE_API_URL=http://localhost:8080/api

VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
```

---

# 🌍 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Payments | Razorpay |

---

# 📷 Screenshots

## Home Page

![Home Page](src/assets/home.png)

---

## Categories

![Categories](src/assets/categories.png)

---

## Provider Details

![Provider Details](src/assets/provider-details.png)

---

## Booking

![Booking](src/assets/booking.png)

---

## Customer Dashboard

![Customer Dashboard](src/assets/customer-dashboard.png)

---

## Provider Dashboard

![Provider Dashboard](src/assets/provider-dashboard.png)

---

## Admin Dashboard

![Admin Dashboard](src/assets/admin-dashboard.png)

---

# 🔒 Security Features

- JWT Authentication
- BCrypt Password Hashing
- Spring Security
- Stateless Authentication
- Role-Based Authorization
- Protected REST APIs
- Secure Payment Verification
- Exception Handling
- Input Validation

---

# 🚀 Performance

- Responsive Design
- Optimized REST APIs
- Fast Page Loading
- React Query Caching
- Lazy Loading
- Stateless Authentication

---

# 🔮 Future Enhancements

- Google Authentication
- Email Verification
- OTP Login
- Live Booking Tracking
- Push Notifications
- AI Service Recommendation
- Chat Support
- Mobile Application

---

# 👨‍💻 Author

## Alok Kumar Gupta

**B.Tech Computer Science & Engineering**

Noida Institute of Engineering & Technology

**Portfolio**

https://alokgupta.dev

**LinkedIn**

https://linkedin.com/in/alokkgupta28

**GitHub**

https://github.com/alokkgupta28

---

# ⭐ Support

If you found this project helpful, please consider giving it a **⭐ Star** on GitHub.

It helps the project gain visibility and motivates further improvements.

---

# 📄 License

This project is licensed under the MIT License.

Feel free to use it for learning and educational purposes.

---

<div align="center">

Made with ❤️ by **Alok Kumar Gupta**

</div>
