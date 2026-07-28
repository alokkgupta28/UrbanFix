<div align="center">

<img src="public/favicon.svg" width="120" alt="UrbanFix Logo"/>

# UrbanFix

### Professional Home Service Booking Platform

Book trusted electricians, plumbers, AC technicians, cleaners, carpenters, painters, salon experts and more with secure online payments, real-time booking management and role-based dashboards.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-black)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B?logo=razorpay)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)

</div>

---

# Live Demo

### Frontend

https://your-vercel-domain.vercel.app

### Backend API

https://urbanfix-9il0.onrender.com

---

# Overview

UrbanFix is a modern full-stack service marketplace inspired by platforms like Urban Company.

Customers can easily discover trusted professionals, book services, make secure online payments, leave reviews and manage bookings.

Service providers manage bookings through a dedicated provider dashboard, while administrators manage users, providers, bookings and platform content through an admin panel.

The application follows a scalable client-server architecture using Spring Boot REST APIs and a React frontend.

---

# Features

## Customer

- User Registration & Login
- JWT Authentication
- Browse Categories
- Search Services
- View Provider Profiles
- Book Services
- Online Razorpay Payments
- Booking History
- Profile Management
- Reviews & Ratings

---

## Provider

- Provider Login
- Provider Dashboard
- View Assigned Bookings
- Update Booking Status
- Manage Profile
- View Customer Reviews

---

## Admin

- Admin Dashboard
- Manage Categories
- Manage Providers
- Manage Customers
- View All Bookings
- Platform Statistics
- User Management

---

## General

- Secure JWT Authentication
- Role-Based Authorization
- Responsive UI
- Modern Tailwind Design
- RESTful APIs
- Razorpay Payment Gateway
- Image Upload Support
- PostgreSQL Database
- Production Deployment

---

# Tech Stack

## Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Axios
- React Query
- React Router

---

## Backend

- Java 17
- Spring Boot 3.4
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- Maven

---

## Database

- PostgreSQL (Neon)

---

## Payment

- Razorpay Checkout
- Server-side Payment Verification

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- Neon PostgreSQL

---

# Project Structure

```
UrbanFix

├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── context
│   └── lib
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── security
│   ├── config
│   └── exception
│
└── README.md
```

---

# Authentication Flow

```
User Login

↓

Spring Security

↓

Authentication Manager

↓

JWT Generation

↓

Frontend Stores Token

↓

Protected APIs

↓

Role Based Authorization
```

---

# Database

Main Tables

- users
- user_roles
- providers
- service_categories
- bookings
- reviews
- profiles

---

# API Modules

Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Categories

```
GET /api/categories
```

Providers

```
GET /api/providers
GET /api/providers/{id}
```

Bookings

```
POST /api/bookings
GET /api/bookings
```

Payments

```
POST /api/payments/create-order
POST /api/payments/verify
```

Reviews

```
GET /api/reviews
POST /api/reviews
```

Admin

```
/api/admin/**
```

---

# Local Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/urbanfix.git

cd urbanfix
```

---

## Backend

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

Configure:

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

```
npm install

npm run dev
```

Environment Variables

```
VITE_API_URL=http://localhost:8080/api

VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
```

---

# Production Deployment

## Frontend

Vercel

## Backend

Render

## Database

Neon PostgreSQL

---

# Security

- BCrypt Password Hashing
- JWT Authentication
- Stateless Sessions
- Spring Security
- Role-Based Access Control
- Protected REST APIs
- Server-side Razorpay Verification

---

# Future Improvements

- Email Notifications
- OTP Verification
- Google Login
- Provider Availability Calendar
- Live Booking Tracking
- AI Service Recommendations
- Push Notifications
- Mobile App
- Analytics Dashboard

---

# Screenshots

Add screenshots here

- Home Page
- Categories
- Provider Profile
- Booking Page
- Razorpay Checkout
- Customer Dashboard
- Provider Dashboard
- Admin Dashboard

---

# Author

**Alok Gupta**

B.Tech Computer Science & Engineering

NIET Greater Noida

GitHub:
https://github.com/alokkgupta28

LinkedIn:
https://linkedin.com/in/alokkgupta28

Portfolio:
https://alokgupta.dev

---

# License

This project is developed for educational and portfolio purposes.

© 2026 Alok Gupta. All Rights Reserved.
